package com.HeavenHomes.Heaven_Homes.review.controller;

import com.HeavenHomes.Heaven_Homes.common.dto.ReviewDto;
import com.HeavenHomes.Heaven_Homes.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/hotels/{hotelId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ReviewDto>> getHotelReviews(@PathVariable Long hotelId) {
        return ResponseEntity.ok(reviewService.getHotelReviews(hotelId));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getHotelRatingSummary(@PathVariable Long hotelId) {
        return ResponseEntity.ok(reviewService.getHotelRatingSummary(hotelId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewDto> addReview(
            @PathVariable Long hotelId,
            @Valid @RequestBody ReviewDto reviewDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.addReview(hotelId, reviewDto));
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long hotelId,
            @PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
