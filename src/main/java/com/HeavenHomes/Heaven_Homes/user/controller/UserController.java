package com.HeavenHomes.Heaven_Homes.user.controller;

import com.HeavenHomes.Heaven_Homes.common.dto.*;
import com.HeavenHomes.Heaven_Homes.booking.service.BookingService;
import com.HeavenHomes.Heaven_Homes.guest.service.GuestService;
import com.HeavenHomes.Heaven_Homes.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/users") @RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final BookingService bookingService;
    private final GuestService guestService;

    @PatchMapping("/profile") @Operation(summary = "Update the user profile", tags = {"Profile"})
    public ResponseEntity<Void> updateProfile(@RequestBody ProfileUpdateRequestDto req) { userService.updateProfile(req); return ResponseEntity.noContent().build(); }

    @GetMapping("/myBookings") @Operation(summary = "Get all my previous bookings", tags = {"Profile"})
    public ResponseEntity<List<BookingDto>> getMyBookings() { return ResponseEntity.ok(bookingService.getMyBookings()); }

    @GetMapping("/profile") @Operation(summary = "Get my Profile", tags = {"Profile"})
    public ResponseEntity<UserDto> getMyProfile() { return ResponseEntity.ok(userService.getMyProfile()); }

    @GetMapping("/guests") @Operation(summary = "Get all my guests", tags = {"Booking Guests"})
    public ResponseEntity<List<GuestDto>> getAllGuests() { return ResponseEntity.ok(guestService.getAllGuests()); }

    @PostMapping("/guests") @Operation(summary = "Add a new guest", tags = {"Booking Guests"})
    public ResponseEntity<GuestDto> addNewGuest(@RequestBody GuestDto guestDto) { return ResponseEntity.status(HttpStatus.CREATED).body(guestService.addNewGuest(guestDto)); }

    @PutMapping("guests/{guestId}") @Operation(summary = "Update a guest", tags = {"Booking Guests"})
    public ResponseEntity<Void> updateGuest(@PathVariable Long guestId, @RequestBody GuestDto guestDto) { guestService.updateGuest(guestId, guestDto); return ResponseEntity.noContent().build(); }

    @DeleteMapping("guests/{guestId}") @Operation(summary = "Remove a guest", tags = {"Booking Guests"})
    public ResponseEntity<Void> deleteGuest(@PathVariable Long guestId) { guestService.deleteGuest(guestId); return ResponseEntity.noContent().build(); }

    @PatchMapping("/becomeHotelManager") @Operation(summary = "Upgrade user to HOTEL_MANAGER", tags = {"Profile"})
    public ResponseEntity<Void> becomeHotelManager(@RequestParam(required = false) String secretCode) { userService.becomeHotelManager(secretCode); return ResponseEntity.noContent().build(); }
}
