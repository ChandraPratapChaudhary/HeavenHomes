package com.HeavenHomes.Heaven_Homes.admin.service;

import com.HeavenHomes.Heaven_Homes.common.dto.BookingDto;
import com.HeavenHomes.Heaven_Homes.common.dto.HotelDto;
import com.HeavenHomes.Heaven_Homes.common.dto.PlatformAnalyticsDto;
import com.HeavenHomes.Heaven_Homes.common.dto.UserDto;
import com.HeavenHomes.Heaven_Homes.common.enums.Role;
import java.util.List;

public interface AdminService {
    List<UserDto> getAllUsers();
    List<HotelDto> getAllHotelsPlatformWide();
    List<BookingDto> getAllBookingsPlatformWide();
    PlatformAnalyticsDto getPlatformAnalytics();
    UserDto updateUserRole(Long userId, Role newRole);
    void toggleHotelStatus(Long hotelId);
    void deleteBookingPermanently(Long bookingId);
}
