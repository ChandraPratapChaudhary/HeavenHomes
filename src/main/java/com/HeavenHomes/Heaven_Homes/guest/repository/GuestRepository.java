package com.HeavenHomes.Heaven_Homes.guest.repository;

import com.HeavenHomes.Heaven_Homes.guest.entity.Guest;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface GuestRepository extends JpaRepository<Guest, Long> {
    List<Guest> findByUser(User user);
    @Modifying
    @Query(value = "DELETE FROM booking_guest WHERE guest_id = :guestId", nativeQuery = true)
    void deleteFromBookingGuests(@Param("guestId") Long guestId);
}
