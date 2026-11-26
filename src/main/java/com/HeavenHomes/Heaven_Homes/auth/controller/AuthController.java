package com.HeavenHomes.Heaven_Homes.auth.controller;

import com.HeavenHomes.Heaven_Homes.common.dto.*;
import com.HeavenHomes.Heaven_Homes.auth.security.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;
import java.util.Arrays;

@RestController @RequestMapping("/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup") @Operation(summary = "Create a new account", tags = {"Auth"})
    public ResponseEntity<UserDto> signup(@Valid @RequestBody SignUpRequestDto req) { return new ResponseEntity<>(authService.signUp(req), HttpStatus.CREATED); }

    @PostMapping("/login") @Operation(summary = "Login request", tags = {"Auth"})
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginDto loginDto, HttpServletRequest httpReq, HttpServletResponse httpRes) {
        String[] tokens = authService.login(loginDto);
        ResponseCookie cookie = ResponseCookie.from("refreshToken", tokens[1]).httpOnly(true).secure(true).sameSite("None").path("/api/v1/auth").maxAge(Duration.ofDays(30)).build();
        httpRes.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(new LoginResponseDto(tokens[0]));
    }

    @PostMapping("/refresh") @Operation(summary = "Refresh the JWT", tags = {"Auth"})
    public ResponseEntity<LoginResponseDto> refresh(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) throw new AuthenticationServiceException("Refresh token not found inside the Cookies");
        String refreshToken = Arrays.stream(cookies).filter(c -> "refreshToken".equals(c.getName())).findFirst().map(Cookie::getValue).orElseThrow(() -> new AuthenticationServiceException("Refresh token not found inside the Cookies"));
        return ResponseEntity.ok(new LoginResponseDto(authService.refreshToken(refreshToken)));
    }
}
