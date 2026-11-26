package com.HeavenHomes.Heaven_Homes.common.dto;

import com.HeavenHomes.Heaven_Homes.common.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingStatusResponseDto {
    private BookingStatus bookingStatus;
}
