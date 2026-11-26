package com.HeavenHomes.Heaven_Homes.booking.controller;

import com.HeavenHomes.Heaven_Homes.common.dto.*;
import com.HeavenHomes.Heaven_Homes.booking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequiredArgsConstructor @RequestMapping("/bookings")
public class HotelBookingController {
    private final BookingService bookingService;

    @PostMapping("/init") @Operation(summary = "Initiate the booking", tags = {"Booking Flow"})
    public ResponseEntity<BookingDto> initialiseBooking(@Valid @RequestBody BookingRequest bookingRequest) { return ResponseEntity.ok(bookingService.initialiseBooking(bookingRequest)); }

    @GetMapping("/{bookingId}") @Operation(summary = "Get full booking details", tags = {"Booking Flow"})
    public ResponseEntity<BookingDto> getBooking(@PathVariable Long bookingId) { return ResponseEntity.ok(bookingService.getBooking(bookingId)); }

    @PostMapping("/{bookingId}/addGuests") @Operation(summary = "Add guest Ids to the booking", tags = {"Booking Flow"})
    public ResponseEntity<BookingDto> addGuests(@PathVariable Long bookingId, @RequestBody List<Long> guestIdList) { return ResponseEntity.ok(bookingService.addGuests(bookingId, guestIdList)); }

    @PostMapping("/{bookingId}/payments") @Operation(summary = "Initiate payments flow", tags = {"Booking Flow"})
    public ResponseEntity<BookingPaymentInitResponseDto> initiatePayment(@PathVariable Long bookingId) { return ResponseEntity.ok(bookingService.initiatePayments(bookingId)); }

    @PostMapping("/{bookingId}/verify-payment") @Operation(summary = "Verify payment client-side", tags = {"Booking Flow"})
    public ResponseEntity<Void> verifyPayment(@PathVariable Long bookingId, @Valid @RequestBody PaymentVerificationRequestDto req) { bookingService.verifyPayment(bookingId, req.getRazorpayOrderId(), req.getRazorpayPaymentId(), req.getRazorpaySignature()); return ResponseEntity.noContent().build(); }

    @PostMapping("/{bookingId}/cancel") @Operation(summary = "Cancel the booking", tags = {"Booking Flow"})
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId) { bookingService.cancelBooking(bookingId); return ResponseEntity.noContent().build(); }

    @GetMapping("/{bookingId}/status") @Operation(summary = "Check the status of the booking", tags = {"Booking Flow"})
    public ResponseEntity<BookingStatusResponseDto> getBookingStatus(@PathVariable Long bookingId) { return ResponseEntity.ok(new BookingStatusResponseDto(bookingService.getBookingStatus(bookingId))); }

    @GetMapping("/micro-status") @Operation(summary = "Get architecture info", tags = {"Booking Flow"})
    public ResponseEntity<Map<String, Object>> getMicroserviceStatus() { return ResponseEntity.ok(Map.of("architecture", "Modular Monolith", "module", "booking", "port", 8080, "status", "RUNNING")); }
}
