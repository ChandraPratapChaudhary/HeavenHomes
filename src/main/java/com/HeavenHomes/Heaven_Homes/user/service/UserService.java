package com.HeavenHomes.Heaven_Homes.user.service;
import com.HeavenHomes.Heaven_Homes.common.dto.ProfileUpdateRequestDto;
import com.HeavenHomes.Heaven_Homes.common.dto.UserDto;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
public interface UserService {
    User getUserById(Long id);
    void updateProfile(ProfileUpdateRequestDto profileUpdateRequestDto);
    UserDto getMyProfile();
    void becomeHotelManager(String secretCode);
}
