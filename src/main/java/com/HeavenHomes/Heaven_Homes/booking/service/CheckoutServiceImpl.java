package com.HeavenHomes.Heaven_Homes.booking.service;

import com.HeavenHomes.Heaven_Homes.common.dto.BookingPaymentInitResponseDto;
import com.HeavenHomes.Heaven_Homes.booking.entity.Booking;
import com.HeavenHomes.Heaven_Homes.booking.repository.BookingRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service @RequiredArgsConstructor @Slf4j
public class CheckoutServiceImpl implements CheckoutService {
    private final BookingRepository bookingRepository;
    private final RazorpayClient razorpayClient;
    @Value("${razorpay.key.id}") private String razorpayKeyId;

    @Override
    public BookingPaymentInitResponseDto createOrder(Booking booking) {
        try {
            long amountInPaise = booking.getAmount().multiply(BigDecimal.valueOf(100)).longValue();
            JSONObject req = new JSONObject(); req.put("amount", amountInPaise); req.put("currency", "INR"); req.put("receipt", "booking_" + booking.getId()); req.put("payment_capture", 1);
            Order order = razorpayClient.orders.create(req); String orderId = order.get("id");
            booking.setPaymentSessionId(orderId); bookingRepository.save(booking);
            return new BookingPaymentInitResponseDto(orderId, amountInPaise, "INR", razorpayKeyId, booking.getHotel().getName() + " : " + booking.getRoom().getType(), "Booking ID: " + booking.getId());
        } catch (RazorpayException e) { throw new RuntimeException(e); }
    }
}
