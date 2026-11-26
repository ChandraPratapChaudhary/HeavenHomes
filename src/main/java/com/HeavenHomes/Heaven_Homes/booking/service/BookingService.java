package com.HeavenHomes.Heaven_Homes.booking.service;

import com.HeavenHomes.Heaven_Homes.common.dto.*;
import com.HeavenHomes.Heaven_Homes.common.enums.BookingStatus;
import org.json.JSONObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface BookingService {
    BookingDto initialiseBooking(BookingRequest bookingRequest);
    BookingDto getBooking(Long bookingId);
    BookingDto addGuests(Long bookingId, List<Long> guestIdList);
    void capturePayment(JSONObject webhookPayload);
    void verifyPayment(Long bookingId, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature);
    BookingPaymentInitResponseDto initiatePayments(Long bookingId);
    void cancelBooking(Long bookingId);
    BookingStatus getBookingStatus(Long bookingId);
    Page<BookingDto> getAllBookingsByHotelId(Long hotelId, Pageable pageable);
    HotelReportDto getHotelReport(Long hotelId, LocalDate startDate, LocalDate endDate);
    List<BookingDto> getMyBookings();
}
