package com.HeavenHomes.Heaven_Homes.review.service;

import com.HeavenHomes.Heaven_Homes.common.dto.ReviewDto;
import com.HeavenHomes.Heaven_Homes.common.enums.Role;
import com.HeavenHomes.Heaven_Homes.common.exception.ResourceNotFoundException;
import com.HeavenHomes.Heaven_Homes.hotel.entity.Hotel;
import com.HeavenHomes.Heaven_Homes.hotel.repository.HotelRepository;
import com.HeavenHomes.Heaven_Homes.review.entity.Review;
import com.HeavenHomes.Heaven_Homes.review.repository.ReviewRepository;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import com.HeavenHomes.Heaven_Homes.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ReviewDto addReview(Long hotelId, ReviewDto reviewDto) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));

        User principal = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));

        if (reviewRepository.existsByHotelIdAndUserId(hotelId, currentUser.getId())) {
            throw new IllegalStateException("You have already submitted a review for this hotel.");
        }

        Review review = Review.builder()
                .hotel(hotel)
                .user(currentUser)
                .rating(reviewDto.getRating())
                .comment(reviewDto.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("Review added for hotel {} by user {}", hotelId, currentUser.getId());
        return mapToDto(savedReview, currentUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDto> getHotelReviews(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));
        return reviewRepository.findByHotelOrderByCreatedAtDesc(hotel)
                .stream()
                .map(review -> mapToDto(review, review.getUser()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getHotelRatingSummary(Long hotelId) {
        Double avg = reviewRepository.getAverageRatingByHotelId(hotelId);
        Long count = reviewRepository.getReviewCountByHotelId(hotelId);
        Map<String, Object> summary = new HashMap<>();
        summary.put("averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        summary.put("totalReviews", count != null ? count : 0L);
        return summary;
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        User principal = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if ((review.getUser() == null || !principal.getId().equals(review.getUser().getId()))
                && (principal.getRoles() == null || !principal.getRoles().contains(Role.SUPER_ADMIN))) {
            throw new AccessDeniedException("You are not authorized to delete this review");
        }
        reviewRepository.delete(review);
        log.info("Review {} deleted", reviewId);
    }

    private ReviewDto mapToDto(Review review, User user) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setReviewerName(user.getName());
        dto.setReviewerEmail(user.getEmail());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
