package com.HeavenHomes.Heaven_Homes.auth.security;

import com.HeavenHomes.Heaven_Homes.common.dto.*;
import com.HeavenHomes.Heaven_Homes.common.enums.Gender;
import com.HeavenHomes.Heaven_Homes.common.enums.Role;
import com.HeavenHomes.Heaven_Homes.common.exception.ResourceNotFoundException;
import com.HeavenHomes.Heaven_Homes.guest.entity.Guest;
import com.HeavenHomes.Heaven_Homes.guest.repository.GuestRepository;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import com.HeavenHomes.Heaven_Homes.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Set;

@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final GuestRepository guestRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;

    public UserDto signUp(SignUpRequestDto req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) throw new RuntimeException("User is already present with same email id");
        User newUser = modelMapper.map(req, User.class); newUser.setRoles(Set.of(Role.GUEST)); newUser.setPassword(passwordEncoder.encode(req.getPassword())); newUser = userRepository.save(newUser);
        if (newUser.getName() != null && !newUser.getName().isBlank()) { try { Guest g = new Guest(); g.setUser(newUser); g.setName(newUser.getName()); g.setPhoneNumber(newUser.getPhoneNumber()); g.setGender(newUser.getGender() != null ? newUser.getGender() : Gender.MALE); g.setDateOfBirth(newUser.getDateOfBirth()); guestRepository.save(g); } catch (Exception ignored) {} }
        return modelMapper.map(newUser, UserDto.class);
    }

    public String[] login(LoginDto loginDto) {
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword()));
        User user = (User) auth.getPrincipal();
        return new String[]{jwtService.generateAccessToken(user), jwtService.generateRefreshToken(user)};
    }

    public String refreshToken(String refreshToken) {
        Long id = jwtService.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return jwtService.generateAccessToken(user);
    }
}
