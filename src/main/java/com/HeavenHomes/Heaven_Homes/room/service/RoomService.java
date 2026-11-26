package com.HeavenHomes.Heaven_Homes.room.service;

import com.HeavenHomes.Heaven_Homes.common.dto.RoomDto;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface RoomService {
    RoomDto createNewRoom(Long hotelId, RoomDto roomDto);
    List<RoomDto> getAllRoomsInHotel(Long hotelId);
    RoomDto getRoomById(Long roomId);
    void deleteRoomById(Long roomId);
    RoomDto updateRoomById(Long hotelId, Long roomId, RoomDto roomDto);
    RoomDto uploadRoomPhoto(Long hotelId, Long roomId, MultipartFile file);
    RoomDto deleteRoomPhoto(Long hotelId, Long roomId, String photoUrl);
}
