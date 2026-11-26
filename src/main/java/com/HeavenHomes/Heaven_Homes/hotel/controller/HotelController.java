package com.HeavenHomes.Heaven_Homes.hotel.controller;

import com.HeavenHomes.Heaven_Homes.common.dto.*;
import com.HeavenHomes.Heaven_Homes.booking.service.BookingService;
import com.HeavenHomes.Heaven_Homes.hotel.service.HotelService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.Map;

@RestController @RequestMapping("/admin/hotels") @RequiredArgsConstructor @Slf4j
public class HotelController {
    private final HotelService hotelService;
    private final BookingService bookingService;

    @PostMapping @Operation(summary = "Create a new hotel", tags = {"Admin Hotel"})
    public ResponseEntity<HotelDto> createNewHotel(@RequestBody HotelDto hotelDto) {
        try { return new ResponseEntity<>(hotelService.createNewHotel(hotelDto), HttpStatus.CREATED); }
        catch (Throwable e) { log.error("HOTEL CREATION ERROR: ", e); throw new RuntimeException("Hotel Creation Failed: " + e.getMessage(), e); }
    }

    @GetMapping("/{hotelId}") @Operation(summary = "Get a hotel by Id", tags = {"Admin Hotel"})
    public ResponseEntity<HotelDto> getHotelById(@PathVariable Long hotelId) { return ResponseEntity.ok(hotelService.getHotelById(hotelId)); }

    @PutMapping("/{hotelId}") @Operation(summary = "Update a hotel", tags = {"Admin Hotel"})
    public ResponseEntity<HotelDto> updateHotelById(@PathVariable Long hotelId, @RequestBody HotelDto hotelDto) { return ResponseEntity.ok(hotelService.updateHotelById(hotelId, hotelDto)); }

    @DeleteMapping("/{hotelId}") @Operation(summary = "Delete a hotel", tags = {"Admin Hotel"})
    public ResponseEntity<Void> deleteHotelById(@PathVariable Long hotelId) { hotelService.deleteHotelById(hotelId); return ResponseEntity.noContent().build(); }

    @PatchMapping("/{hotelId}/activate") @Operation(summary = "Activate a hotel", tags = {"Admin Hotel"})
    public ResponseEntity<Void> activateHotel(@PathVariable Long hotelId) { hotelService.activateHotel(hotelId); return ResponseEntity.noContent().build(); }

    @GetMapping public ResponseEntity<Page<HotelDto>> getAllHotels(Pageable pageable) { return ResponseEntity.ok(hotelService.getAllHotels(pageable)); }

    @GetMapping("/{hotelId}/bookings")
    public ResponseEntity<Page<BookingDto>> getAllBookingsByHotelId(@PathVariable Long hotelId, Pageable pageable) { return ResponseEntity.ok(bookingService.getAllBookingsByHotelId(hotelId, pageable)); }

    @GetMapping("/{hotelId}/reports") @Operation(summary = "Generate a bookings report", tags = {"Admin Bookings"})
    public ResponseEntity<HotelReportDto> getHotelReport(@PathVariable Long hotelId, @RequestParam(required = false) LocalDate startDate, @RequestParam(required = false) LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusMonths(1);
        if (endDate == null) endDate = LocalDate.now();
        return ResponseEntity.ok(bookingService.getHotelReport(hotelId, startDate, endDate));
    }

    @PostMapping("/{hotelId}/photos") @Operation(summary = "Upload a photo for a hotel", tags = {"Admin Hotel"})
    public ResponseEntity<HotelDto> uploadHotelPhoto(@PathVariable Long hotelId, @RequestParam("file") MultipartFile file) {
        try { return ResponseEntity.ok(hotelService.uploadHotelPhoto(hotelId, file)); }
        catch (Throwable e) { log.error("PHOTO UPLOAD ERROR: ", e); throw new RuntimeException("Backend Photo Upload Failed: " + e.getMessage(), e); }
    }

    @DeleteMapping("/{hotelId}/photos") @Operation(summary = "Delete a photo from a hotel", tags = {"Admin Hotel"})
    public ResponseEntity<HotelDto> deleteHotelPhoto(@PathVariable Long hotelId, @RequestParam(name = "photoUrl", required = false) String photoUrl, @RequestBody(required = false) Map<String, String> body) {
        String url = photoUrl; if ((url == null || url.isEmpty()) && body != null) url = body.get("photoUrl");
        return ResponseEntity.ok(hotelService.deleteHotelPhoto(hotelId, url));
    }
}
