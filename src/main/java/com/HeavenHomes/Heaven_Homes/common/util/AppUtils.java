package com.HeavenHomes.Heaven_Homes.common.util;

import com.HeavenHomes.Heaven_Homes.user.entity.User;
import com.HeavenHomes.Heaven_Homes.common.exception.UnAuthorisedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class AppUtils {
    public static User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user;
        }
        throw new UnAuthorisedException("User authentication session is invalid or expired. Please login again.");
    }
}
