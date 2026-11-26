package com.HeavenHomes.Heaven_Homes.hotel.controller;

import com.HeavenHomes.Heaven_Homes.common.dto.HotelInfoDto;
import com.HeavenHomes.Heaven_Homes.common.dto.HotelInfoRequestDto;
import com.HeavenHomes.Heaven_Homes.common.dto.HotelPriceResponseDto;
import com.HeavenHomes.Heaven_Homes.common.dto.HotelSearchRequest;
import com.HeavenHomes.Heaven_Homes.hotel.service.HotelService;
import com.HeavenHomes.Heaven_Homes.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/hotels")
@RequiredArgsConstructor
public class HotelBrowseController {

    private final InventoryService inventoryService;
    private final HotelService hotelService;

    @GetMapping("/search")
    @Operation(summary = "Search hotels", tags = {"Browse Hotels"})
    public ResponseEntity<Page<HotelPriceResponseDto>> searchHotels(
            @RequestParam String city,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam Integer roomsCount,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        HotelSearchRequest req = new HotelSearchRequest();
        req.setCity(city); req.setStartDate(startDate); req.setEndDate(endDate);
        req.setRoomsCount(roomsCount); req.setPage(page); req.setSize(size);
        return ResponseEntity.ok(inventoryService.searchHotels(req));
    }

    @GetMapping("/{hotelId}/info")
    @Operation(summary = "Get a hotel info by hotelId", tags = {"Browse Hotels"})
    public ResponseEntity<HotelInfoDto> getHotelInfo(
            @PathVariable Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam Long roomsCount) {

        HotelInfoRequestDto req = new HotelInfoRequestDto();
        req.setStartDate(startDate); req.setEndDate(endDate); req.setRoomsCount(roomsCount);
        return ResponseEntity.ok(hotelService.getHotelInfoById(hotelId, req));
    }

    @GetMapping("/cities")
    @Operation(summary = "Get list of distinct active cities from database", tags = {"Browse Hotels"})
    public ResponseEntity<List<String>> getActiveCities() {
        return ResponseEntity.ok(hotelService.getAllActiveCities());
    }
}
