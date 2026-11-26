package com.HeavenHomes.Heaven_Homes.review.repository;

import com.HeavenHomes.Heaven_Homes.hotel.entity.Hotel;
import com.HeavenHomes.Heaven_Homes.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByHotelOrderByCreatedAtDesc(Hotel hotel);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId")
    Double getAverageRatingByHotelId(@Param("hotelId") Long hotelId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.hotel.id = :hotelId")
    Long getReviewCountByHotelId(@Param("hotelId") Long hotelId);

    boolean existsByHotelIdAndUserId(Long hotelId, Long userId);
}
