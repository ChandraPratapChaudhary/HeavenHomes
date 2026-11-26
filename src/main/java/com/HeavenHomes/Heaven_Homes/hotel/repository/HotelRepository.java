package com.HeavenHomes.Heaven_Homes.hotel.repository;

import com.HeavenHomes.Heaven_Homes.hotel.entity.Hotel;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByOwner(User user);
    Page<Hotel> findByOwner(User user, Pageable pageable);
    @Query("SELECT DISTINCT h.city FROM Hotel h WHERE h.active = true AND h.city IS NOT NULL")
    List<String> findDistinctActiveCities();
}
