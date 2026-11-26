package com.HeavenHomes.Heaven_Homes.admin.service;

import com.HeavenHomes.Heaven_Homes.common.dto.BookingDto;
import com.HeavenHomes.Heaven_Homes.common.dto.HotelDto;
import com.HeavenHomes.Heaven_Homes.common.dto.PlatformAnalyticsDto;
import com.HeavenHomes.Heaven_Homes.common.dto.UserDto;
import com.HeavenHomes.Heaven_Homes.common.enums.BookingStatus;
import com.HeavenHomes.Heaven_Homes.common.enums.Role;
import com.HeavenHomes.Heaven_Homes.common.exception.ResourceNotFoundException;
import com.HeavenHomes.Heaven_Homes.booking.entity.Booking;
import com.HeavenHomes.Heaven_Homes.booking.repository.BookingRepository;
import com.HeavenHomes.Heaven_Homes.hotel.entity.Hotel;
import com.HeavenHomes.Heaven_Homes.hotel.repository.HotelRepository;
import com.HeavenHomes.Heaven_Homes.hotel.service.HotelService;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import com.HeavenHomes.Heaven_Homes.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;
    private final HotelService hotelService;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        log.info("Fetching all registered users for platform admin");
        return userRepository.findAll().stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDto> getAllHotelsPlatformWide() {
        log.info("Fetching all hotels platform wide for super admin");
        return hotelRepository.findAll().stream()
                .map(hotel -> modelMapper.map(hotel, HotelDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDto> getAllBookingsPlatformWide() {
        log.info("Fetching all bookings platform wide for super admin");
        return bookingRepository.findAll().stream()
                .map(booking -> {
                    BookingDto dto = modelMapper.map(booking, BookingDto.class);
                    if (booking.getHotel() != null) dto.setHotelName(booking.getHotel().getName());
                    if (booking.getRoom() != null) {
                        dto.setRoomType(booking.getRoom().getType());
                        dto.setRoomCapacity(booking.getRoom().getCapacity());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PlatformAnalyticsDto getPlatformAnalytics() {
        log.info("Calculating platform analytics");
        List<User> allUsers = userRepository.findAll();
        Long totalUsers = (long) allUsers.size();
        Long totalManagers = allUsers.stream().filter(u -> u.getRoles().contains(Role.HOTEL_MANAGER)).count();
        List<Hotel> allHotels = hotelRepository.findAll();
        Long totalHotels = (long) allHotels.size();
        Long totalActiveHotels = allHotels.stream().filter(h -> Boolean.TRUE.equals(h.getActive())).count();
        List<Booking> allBookings = bookingRepository.findAll();
        Long totalBookings = (long) allBookings.size();
        BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new PlatformAnalyticsDto(totalUsers, totalManagers, totalHotels, totalActiveHotels, totalBookings, totalRevenue);
    }

    @Override
    @Transactional
    public UserDto updateUserRole(Long userId, Role newRole) {
        log.info("Updating user {} role to {}", userId, newRole);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.getRoles().clear();
        user.getRoles().add(Role.GUEST);
        if (newRole == Role.HOTEL_MANAGER || newRole == Role.SUPER_ADMIN) user.getRoles().add(Role.HOTEL_MANAGER);
        if (newRole == Role.SUPER_ADMIN) user.getRoles().add(Role.SUPER_ADMIN);
        return modelMapper.map(userRepository.save(user), UserDto.class);
    }

    @Override
    @Transactional
    public void toggleHotelStatus(Long hotelId) {
        log.info("Toggling status for hotel with ID: {}", hotelId);
        hotelService.activateHotel(hotelId);
    }

    @Override
    @Transactional
    public void deleteBookingPermanently(Long bookingId) {
        log.info("Super admin deleting booking permanently with ID: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        if (booking.getGuests() != null) { booking.getGuests().clear(); bookingRepository.save(booking); }
        bookingRepository.delete(booking);
    }
}
