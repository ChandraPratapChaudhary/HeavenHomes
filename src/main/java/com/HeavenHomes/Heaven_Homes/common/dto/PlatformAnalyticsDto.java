package com.HeavenHomes.Heaven_Homes.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlatformAnalyticsDto {
    private Long totalUsers;
    private Long totalManagers;
    private Long totalHotels;
    private Long totalActiveHotels;
    private Long totalBookings;
    private BigDecimal totalPlatformRevenue;
}
