package com.HeavenHomes.Heaven_Homes.booking.service;

import com.HeavenHomes.Heaven_Homes.common.dto.*;
import com.HeavenHomes.Heaven_Homes.booking.entity.Booking;
import com.HeavenHomes.Heaven_Homes.booking.repository.BookingRepository;
import com.HeavenHomes.Heaven_Homes.common.enums.BookingStatus;
import com.HeavenHomes.Heaven_Homes.common.exception.ResourceNotFoundException;
import com.HeavenHomes.Heaven_Homes.common.exception.UnAuthorisedException;
import com.HeavenHomes.Heaven_Homes.guest.entity.Guest;
import com.HeavenHomes.Heaven_Homes.guest.repository.GuestRepository;
import com.HeavenHomes.Heaven_Homes.hotel.entity.Hotel;
import com.HeavenHomes.Heaven_Homes.hotel.repository.HotelRepository;
import com.HeavenHomes.Heaven_Homes.inventory.entity.Inventory;
import com.HeavenHomes.Heaven_Homes.inventory.repository.InventoryRepository;
import com.HeavenHomes.Heaven_Homes.pricing.service.PricingService;
import com.HeavenHomes.Heaven_Homes.room.entity.Room;
import com.HeavenHomes.Heaven_Homes.room.repository.RoomRepository;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import static com.HeavenHomes.Heaven_Homes.common.util.AppUtils.getCurrentUser;

@Service @Slf4j @RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    private final GuestRepository guestRepository;
    private final ModelMapper modelMapper;
    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final InventoryRepository inventoryRepository;
    private final CheckoutService checkoutService;
    private final PricingService pricingService;
    private final RazorpayClient razorpayClient;
    @Value("${frontend.url}") private String frontendUrl;
    @Value("${razorpay.key.secret}") private String razorpayKeySecret;

    @PostConstruct @Transactional
    public void cleanupOldUnpaidBookingsOnStartup() {
        try { bookingRepository.deleteOldUnpaidBookingGuests(); bookingRepository.deleteOldUnpaidBookings(); log.info("Startup cleanup done."); }
        catch (Exception e) { log.warn("Cleanup failed: {}", e.getMessage()); }
    }

    @Override @Transactional
    public BookingDto initialiseBooking(BookingRequest req) {
        Hotel hotel = hotelRepository.findById(req.getHotelId()).orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + req.getHotelId()));
        Room room = roomRepository.findById(req.getRoomId()).orElseThrow(() -> new ResourceNotFoundException("Room not found: " + req.getRoomId()));
        List<Inventory> inv = inventoryRepository.findAndLockAvailableInventory(room.getId(), req.getCheckInDate(), req.getCheckOutDate(), req.getRoomsCount());
        long days = ChronoUnit.DAYS.between(req.getCheckInDate(), req.getCheckOutDate()) + 1;
        if (inv.size() != days) throw new IllegalStateException("Room is not available anymore");
        inventoryRepository.initBooking(room.getId(), req.getCheckInDate(), req.getCheckOutDate(), req.getRoomsCount());
        BigDecimal total = pricingService.calculateTotalPrice(inv).multiply(BigDecimal.valueOf(req.getRoomsCount()));
        Booking booking = Booking.builder().bookingStatus(BookingStatus.RESERVED).hotel(hotel).room(room).checkInDate(req.getCheckInDate()).checkOutDate(req.getCheckOutDate()).user(getCurrentUser()).roomsCount(req.getRoomsCount()).amount(total).build();
        return mapToBookingDto(bookingRepository.save(booking));
    }

    private BookingDto mapToBookingDto(Booking booking) {
        BookingDto dto = modelMapper.map(booking, BookingDto.class);
        if (booking.getRoom() != null && booking.getRoom().getCapacity() != null) dto.setRoomCapacity(booking.getRoom().getCapacity());
        return dto;
    }

    @Override @Transactional(readOnly = true)
    public BookingDto getBooking(Long bookingId) {
        Booking b = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        User u = getCurrentUser();
        if (b.getUser() == null || !u.getId().equals(b.getUser().getId())) throw new UnAuthorisedException("Booking does not belong to this user: " + u.getId());
        return mapToBookingDto(b);
    }

    @Override @Transactional
    public BookingDto addGuests(Long bookingId, List<Long> guestIdList) {
        Booking b = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        User u = getCurrentUser();
        if (b.getUser() == null || !u.getId().equals(b.getUser().getId())) throw new UnAuthorisedException("Booking does not belong to this user: " + u.getId());
        if (hasBookingExpired(b)) throw new IllegalStateException("Booking has already expired");
        if (b.getBookingStatus() != BookingStatus.RESERVED) throw new IllegalStateException("Booking is not under reserved state");
        int cap = (b.getRoom() != null && b.getRoom().getCapacity() != null) ? b.getRoom().getCapacity() : 2;
        if (guestIdList.size() > b.getRoomsCount() * cap) throw new IllegalArgumentException("Too many guests for this booking");
        for (Long gid : guestIdList) { Guest g = guestRepository.findById(gid).orElseThrow(() -> new ResourceNotFoundException("Guest not found: " + gid)); b.getGuests().add(g); }
        b.setBookingStatus(BookingStatus.GUESTS_ADDED);
        return mapToBookingDto(bookingRepository.save(b));
    }

    @Override @Transactional
    public BookingPaymentInitResponseDto initiatePayments(Long bookingId) {
        Booking b = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        User u = getCurrentUser();
        if (b.getUser() == null || !u.getId().equals(b.getUser().getId())) throw new UnAuthorisedException("Booking does not belong to this user: " + u.getId());
        if (hasBookingExpired(b)) throw new IllegalStateException("Booking has already expired");
        BookingPaymentInitResponseDto orderDetails = checkoutService.createOrder(b);
        b.setBookingStatus(BookingStatus.PAYMENTS_PENDING); bookingRepository.save(b);
        return orderDetails;
    }

    @Override @Transactional
    public void capturePayment(JSONObject payload) {
        String eventType = payload.optString("event");
        log.info("capturePayment() called with event = {}", eventType);
        if ("payment.captured".equals(eventType)) {
            JSONObject pe = payload.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            String orderId = pe.getString("order_id"), paymentId = pe.getString("id");
            Booking b = bookingRepository.findByPaymentSessionId(orderId).orElseThrow(() -> new ResourceNotFoundException("Booking not found for order: " + orderId));
            b.setPaymentId(paymentId); b.setBookingStatus(BookingStatus.CONFIRMED); bookingRepository.save(b);
            inventoryRepository.confirmBooking(b.getRoom().getId(), b.getCheckInDate(), b.getCheckOutDate(), b.getRoomsCount());
        }
    }

    @Override @Transactional
    public void verifyPayment(Long bookingId, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        Booking b = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        User u = getCurrentUser();
        if (b.getUser() == null || !u.getId().equals(b.getUser().getId())) throw new UnAuthorisedException("Booking does not belong to this user: " + u.getId());
        if (!razorpayOrderId.equals(b.getPaymentSessionId())) throw new IllegalStateException("Order ID does not match this booking");
        if (b.getBookingStatus() == BookingStatus.CONFIRMED) return;
        try {
            JSONObject opts = new JSONObject(); opts.put("razorpay_order_id", razorpayOrderId); opts.put("razorpay_payment_id", razorpayPaymentId); opts.put("razorpay_signature", razorpaySignature);
            if (!com.razorpay.Utils.verifyPaymentSignature(opts, razorpayKeySecret)) throw new UnAuthorisedException("Payment signature verification failed for booking: " + bookingId);
        } catch (RazorpayException e) { throw new RuntimeException(e); }
        b.setPaymentId(razorpayPaymentId); b.setBookingStatus(BookingStatus.CONFIRMED); bookingRepository.save(b);
        inventoryRepository.confirmBooking(b.getRoom().getId(), b.getCheckInDate(), b.getCheckOutDate(), b.getRoomsCount());
    }

    @Override @Transactional
    public void cancelBooking(Long bookingId) {
        Booking b = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        User u = getCurrentUser();
        if (b.getUser() == null || !u.getId().equals(b.getUser().getId())) throw new UnAuthorisedException("Booking does not belong to this user: " + u.getId());
        BookingStatus status = b.getBookingStatus();
        if (status == BookingStatus.CANCELLED || status == BookingStatus.EXPIRED) throw new IllegalStateException("This booking is already " + status.name().toLowerCase());
        if (!b.getCheckInDate().isAfter(LocalDate.now())) throw new IllegalStateException("Cannot cancel a booking on or after its check-in date.");
        if (status == BookingStatus.CONFIRMED) {
            b.setBookingStatus(BookingStatus.CANCELLED); bookingRepository.save(b);
            inventoryRepository.findAndLockReservedInventory(b.getRoom().getId(), b.getCheckInDate(), b.getCheckOutDate(), b.getRoomsCount());
            inventoryRepository.cancelBooking(b.getRoom().getId(), b.getCheckInDate(), b.getCheckOutDate(), b.getRoomsCount());
            try { razorpayClient.payments.refund(b.getPaymentId(), new JSONObject()); } catch (RazorpayException e) { throw new RuntimeException(e); }
        } else {
            inventoryRepository.releaseReservedInventory(b.getRoom().getId(), b.getCheckInDate(), b.getCheckOutDate(), b.getRoomsCount());
            b.getGuests().clear(); bookingRepository.delete(b);
        }
    }

    @Override
    public BookingStatus getBookingStatus(Long bookingId) {
        Booking b = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        User u = getCurrentUser();
        if (b.getUser() == null || !u.getId().equals(b.getUser().getId())) throw new UnAuthorisedException("Booking does not belong to this user: " + u.getId());
        return b.getBookingStatus();
    }

    @Override @Transactional(readOnly = true)
    public Page<BookingDto> getAllBookingsByHotelId(Long hotelId, Pageable pageable) {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + hotelId));
        User u = getCurrentUser();
        if (hotel.getOwner() == null || !u.getId().equals(hotel.getOwner().getId())) throw new AccessDeniedException("You are not the owner of hotel: " + hotelId);
        return bookingRepository.findByHotel(hotel, pageable).map(e -> modelMapper.map(e, BookingDto.class));
    }

    @Override @Transactional(readOnly = true)
    public HotelReportDto getHotelReport(Long hotelId, LocalDate startDate, LocalDate endDate) {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + hotelId));
        User u = getCurrentUser();
        if (hotel.getOwner() == null || !u.getId().equals(hotel.getOwner().getId())) throw new AccessDeniedException("You are not the owner of hotel: " + hotelId);
        List<Booking> bookings = bookingRepository.findByHotelAndCreatedAtBetween(hotel, startDate.atStartOfDay(), endDate.atTime(LocalTime.MAX));
        Long total = bookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED).count();
        BigDecimal revenue = bookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED).map(Booking::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal avg = total == 0 ? BigDecimal.ZERO : revenue.divide(BigDecimal.valueOf(total), RoundingMode.HALF_UP);
        return new HotelReportDto(total, revenue, avg);
    }

    @Override @Transactional(readOnly = true)
    public List<BookingDto> getMyBookings() {
        User u = getCurrentUser();
        return bookingRepository.findByUser(u).stream().filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED || b.getBookingStatus() == BookingStatus.CANCELLED).map(e -> modelMapper.map(e, BookingDto.class)).collect(Collectors.toList());
    }

    public boolean hasBookingExpired(Booking booking) { return booking.getCreatedAt().plusMinutes(10).isBefore(LocalDateTime.now()); }
}
