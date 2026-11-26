package com.HeavenHomes.Heaven_Homes.admin.controller;

import com.HeavenHomes.Heaven_Homes.admin.service.AdminService;
import com.HeavenHomes.Heaven_Homes.common.dto.BookingDto;
import com.HeavenHomes.Heaven_Homes.common.dto.HotelDto;
import com.HeavenHomes.Heaven_Homes.common.dto.PlatformAnalyticsDto;
import com.HeavenHomes.Heaven_Homes.common.dto.UserDto;
import com.HeavenHomes.Heaven_Homes.common.enums.Role;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @Operation(summary = "Get all registered users for Platform Developer Admin", tags = {"Super Admin"})
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/platform-hotels")
    @Operation(summary = "Get all hotels platform wide for Super Admin", tags = {"Super Admin"})
    public ResponseEntity<List<HotelDto>> getAllHotelsPlatformWide() {
        return ResponseEntity.ok(adminService.getAllHotelsPlatformWide());
    }

    @GetMapping("/bookings")
    @Operation(summary = "Get all bookings platform wide for Super Admin", tags = {"Super Admin"})
    public ResponseEntity<List<BookingDto>> getAllBookingsPlatformWide() {
        return ResponseEntity.ok(adminService.getAllBookingsPlatformWide());
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get platform wide system analytics for Super Admin", tags = {"Super Admin"})
    public ResponseEntity<PlatformAnalyticsDto> getPlatformAnalytics() {
        return ResponseEntity.ok(adminService.getPlatformAnalytics());
    }

    @PatchMapping("/users/{userId}/role")
    @Operation(summary = "Update user role (SUPER_ADMIN, HOTEL_MANAGER, GUEST)", tags = {"Super Admin"})
    public ResponseEntity<UserDto> updateUserRole(@PathVariable Long userId, @RequestParam Role newRole) {
        return ResponseEntity.ok(adminService.updateUserRole(userId, newRole));
    }

    @PatchMapping("/hotels/{hotelId}/toggle-status")
    @Operation(summary = "Force Activate / Deactivate any hotel platform wide", tags = {"Super Admin"})
    public ResponseEntity<Void> toggleHotelStatus(@PathVariable Long hotelId) {
        adminService.toggleHotelStatus(hotelId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/bookings/{bookingId}")
    @Operation(summary = "Permanently delete a booking from platform", tags = {"Super Admin"})
    public ResponseEntity<Void> deleteBookingPermanently(@PathVariable Long bookingId) {
        adminService.deleteBookingPermanently(bookingId);
        return ResponseEntity.noContent().build();
    }
}
