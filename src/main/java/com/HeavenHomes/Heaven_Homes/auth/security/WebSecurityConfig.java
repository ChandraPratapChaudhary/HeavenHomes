package com.HeavenHomes.Heaven_Homes.auth.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Configuration @EnableWebSecurity @EnableMethodSecurity @RequiredArgsConstructor
public class WebSecurityConfig {
    private final JWTAuthFilter jwtAuthFilter;
    @Autowired @Qualifier("handlerExceptionResolver") private HandlerExceptionResolver handlerExceptionResolver;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults()).csrf(c -> c.disable()).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(a -> a.requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll().requestMatchers("/admin/hotels/**", "/admin/inventory/**").hasAnyRole("HOTEL_MANAGER", "SUPER_ADMIN").requestMatchers("/admin/**").hasRole("SUPER_ADMIN").requestMatchers("/bookings/**").authenticated().requestMatchers("/users/**").authenticated().anyRequest().permitAll())
            .exceptionHandling(e -> e.accessDeniedHandler(accessDeniedHandler()));
        return http.build();
    }

    @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception { return c.getAuthenticationManager(); }
    @Bean public AccessDeniedHandler accessDeniedHandler() { return (req, res, ex) -> handlerExceptionResolver.resolveException(req, res, null, ex); }
}
