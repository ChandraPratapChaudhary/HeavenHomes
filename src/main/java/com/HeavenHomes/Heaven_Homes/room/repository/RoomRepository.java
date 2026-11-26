package com.HeavenHomes.Heaven_Homes.room.repository;

import com.HeavenHomes.Heaven_Homes.hotel.entity.Hotel;
import com.HeavenHomes.Heaven_Homes.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHotel(Hotel hotel);
}
