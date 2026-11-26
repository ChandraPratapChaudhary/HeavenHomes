package com.HeavenHomes.Heaven_Homes.inventory.service;

import com.HeavenHomes.Heaven_Homes.common.dto.*;
import com.HeavenHomes.Heaven_Homes.room.entity.Room;
import org.springframework.data.domain.Page;
import java.util.List;

public interface InventoryService {
    void initializeRoomForAYear(Room room);
    void deleteAllInventories(Room room);
    Page<HotelPriceResponseDto> searchHotels(HotelSearchRequest hotelSearchRequest);
    List<InventoryDto> getAllInventoryByRoom(Long roomId);
    void updateInventory(Long roomId, UpdateInventoryRequestDto updateInventoryRequestDto);
}
