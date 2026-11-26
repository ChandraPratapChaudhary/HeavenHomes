package com.HeavenHomes.Heaven_Homes.review.service;

import com.HeavenHomes.Heaven_Homes.common.dto.ReviewDto;
import java.util.List;
import java.util.Map;

public interface ReviewService {
    ReviewDto addReview(Long hotelId, ReviewDto reviewDto);
    List<ReviewDto> getHotelReviews(Long hotelId);
    Map<String, Object> getHotelRatingSummary(Long hotelId);
    void deleteReview(Long reviewId);
}
