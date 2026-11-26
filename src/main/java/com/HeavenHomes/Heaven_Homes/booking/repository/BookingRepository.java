package com.HeavenHomes.Heaven_Homes.booking.repository;

import com.HeavenHomes.Heaven_Homes.booking.entity.Booking;
import com.HeavenHomes.Heaven_Homes.hotel.entity.Hotel;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByPaymentSessionId(String sessionId);
    List<Booking> findByHotel(Hotel hotel);
    Page<Booking> findByHotel(Hotel hotel, Pageable pageable);
    List<Booking> findByHotelAndCreatedAtBetween(Hotel hotel, LocalDateTime startDateTime, LocalDateTime endDateTime);
    List<Booking> findByUser(User user);
    @Modifying
    @Query(value = "DELETE FROM booking_guest WHERE booking_id IN (SELECT id FROM booking WHERE booking_status != 'CONFIRMED' AND (payment_id IS NULL OR payment_id = ''))", nativeQuery = true)
    void deleteOldUnpaidBookingGuests();
    @Modifying
    @Query(value = "DELETE FROM booking WHERE booking_status != 'CONFIRMED' AND (payment_id IS NULL OR payment_id = '')", nativeQuery = true)
    void deleteOldUnpaidBookings();
}
