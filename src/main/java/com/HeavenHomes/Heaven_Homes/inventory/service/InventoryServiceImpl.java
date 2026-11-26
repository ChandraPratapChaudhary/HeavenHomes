package com.HeavenHomes.Heaven_Homes.inventory.service;

import com.HeavenHomes.Heaven_Homes.common.dto.*;
import com.HeavenHomes.Heaven_Homes.common.enums.Role;
import com.HeavenHomes.Heaven_Homes.common.exception.ResourceNotFoundException;
import com.HeavenHomes.Heaven_Homes.hotel.repository.HotelMinPriceRepository;
import com.HeavenHomes.Heaven_Homes.inventory.entity.Inventory;
import com.HeavenHomes.Heaven_Homes.inventory.repository.InventoryRepository;
import com.HeavenHomes.Heaven_Homes.hotel.entity.Hotel;
import com.HeavenHomes.Heaven_Homes.room.entity.Room;
import com.HeavenHomes.Heaven_Homes.room.repository.RoomRepository;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import static com.HeavenHomes.Heaven_Homes.common.util.AppUtils.getCurrentUser;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceImpl implements InventoryService {
    private final RoomRepository roomRepository;
    private final ModelMapper modelMapper;
    private final InventoryRepository inventoryRepository;
    private final HotelMinPriceRepository hotelMinPriceRepository;

    @Override
    public void initializeRoomForAYear(Room room) {
        LocalDate today = LocalDate.now(), end = today.plusYears(1);
        Set<LocalDate> existing = inventoryRepository.findByRoomOrderByDate(room).stream().map(Inventory::getDate).collect(Collectors.toSet());
        List<Inventory> list = new ArrayList<>();
        for (; !today.isAfter(end); today = today.plusDays(1)) {
            if (existing.contains(today)) continue;
            list.add(Inventory.builder().hotel(room.getHotel()).room(room).bookedCount(0).reservedCount(0).city(room.getHotel().getCity()).date(today).price(room.getBasePrice()).surgeFactor(BigDecimal.ONE).totalCount(room.getTotalCount()).closed(false).build());
        }
        if (!list.isEmpty()) inventoryRepository.saveAll(list);
    }

    @Override
    public void deleteAllInventories(Room room) { inventoryRepository.deleteByRoom(room); }

    @Override
    public Page<HotelPriceResponseDto> searchHotels(HotelSearchRequest req) {
        long dateCount = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;
        Page<HotelPriceDto> page = hotelMinPriceRepository.findHotelsWithAvailableInventory(req.getCity(), req.getStartDate(), req.getEndDate(), dateCount, PageRequest.of(req.getPage(), req.getSize()));
        return page.map(dto -> { HotelPriceResponseDto r = modelMapper.map(dto.getHotel(), HotelPriceResponseDto.class); r.setPrice(dto.getPrice()); return r; });
    }

    @Override
    public List<InventoryDto> getAllInventoryByRoom(Long roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        if (!isOwnerOrSuperAdmin(room.getHotel(), getCurrentUser())) throw new AccessDeniedException("You are not the owner of room with id: " + roomId);
        return inventoryRepository.findByRoomOrderByDate(room).stream().map(e -> modelMapper.map(e, InventoryDto.class)).collect(Collectors.toList());
    }

    @Override @Transactional
    public void updateInventory(Long roomId, UpdateInventoryRequestDto req) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        if (!isOwnerOrSuperAdmin(room.getHotel(), getCurrentUser())) throw new AccessDeniedException("You are not the owner of room with id: " + roomId);
        inventoryRepository.getInventoryAndLockBeforeUpdate(roomId, req.getStartDate(), req.getEndDate());
        inventoryRepository.updateInventory(roomId, req.getStartDate(), req.getEndDate(), req.getClosed(), req.getSurgeFactor());
    }

    private boolean isOwnerOrSuperAdmin(Hotel hotel, User user) {
        if (user == null || hotel == null) return false;
        if (user.getRoles() != null && user.getRoles().contains(Role.SUPER_ADMIN)) return true;
        return hotel.getOwner() != null && user.getId().equals(hotel.getOwner().getId());
    }
}
