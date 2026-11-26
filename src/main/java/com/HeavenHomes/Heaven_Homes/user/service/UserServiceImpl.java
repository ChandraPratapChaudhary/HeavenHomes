package com.HeavenHomes.Heaven_Homes.user.service;

import com.HeavenHomes.Heaven_Homes.common.dto.*;
import com.HeavenHomes.Heaven_Homes.common.enums.Role;
import com.HeavenHomes.Heaven_Homes.common.exception.ResourceNotFoundException;
import com.HeavenHomes.Heaven_Homes.common.exception.UnAuthorisedException;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import com.HeavenHomes.Heaven_Homes.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import static com.HeavenHomes.Heaven_Homes.common.util.AppUtils.getCurrentUser;

@Service @RequiredArgsConstructor @Slf4j
public class UserServiceImpl implements UserService, UserDetailsService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final JdbcTemplate jdbcTemplate;

    @Override public User getUserById(Long id) { return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)); }

    @Override @Transactional
    public void updateProfile(ProfileUpdateRequestDto req) {
        User u = getCurrentUser();
        User db = userRepository.findById(u.getId()).orElseThrow(() -> new ResourceNotFoundException("User not found: " + u.getId()));
        if (req.getDateOfBirth() != null) db.setDateOfBirth(req.getDateOfBirth());
        if (req.getGender() != null) db.setGender(req.getGender());
        if (req.getName() != null) db.setName(req.getName());
        if (req.getPhoneNumber() != null) db.setPhoneNumber(req.getPhoneNumber());
        userRepository.save(db);
    }

    @Override @Transactional(readOnly = true)
    public UserDto getMyProfile() {
        User u = getCurrentUser();
        User db = userRepository.findById(u.getId()).orElseThrow(() -> new ResourceNotFoundException("User not found: " + u.getId()));
        return modelMapper.map(db, UserDto.class);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    @Override @Transactional
    public void becomeHotelManager(String secretCode) {
        User current = getCurrentUser();
        String code = secretCode != null ? secretCode.trim().replace("\"", "").replace("'", "") : "";
        boolean isMgr = "HEAVEN2026".equalsIgnoreCase(code), isAdmin = "SUPERADMIN123".equalsIgnoreCase(code);
        if (!isMgr && !isAdmin) throw new UnAuthorisedException("Invalid secret passcode '" + code + "' for role upgrade.");
        User u = userRepository.findById(current.getId()).orElseThrow(() -> new ResourceNotFoundException("User not found: " + current.getId()));
        if (u.getRoles() == null) u.setRoles(new HashSet<>());
        u.getRoles().clear(); u.getRoles().add(Role.GUEST); u.getRoles().add(Role.HOTEL_MANAGER);
        if (isAdmin) u.getRoles().add(Role.SUPER_ADMIN);
        userRepository.save(u);
    }
}
