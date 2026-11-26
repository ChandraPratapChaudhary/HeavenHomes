package com.HeavenHomes.Heaven_Homes.booking.service;
import com.HeavenHomes.Heaven_Homes.common.dto.BookingPaymentInitResponseDto;
import com.HeavenHomes.Heaven_Homes.booking.entity.Booking;
public interface CheckoutService {
    BookingPaymentInitResponseDto createOrder(Booking booking);
}
