package com.HeavenHomes.Heaven_Homes.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingPaymentInitResponseDto {
    private String orderId;
    private Long amount;
    private String currency;
    private String keyId;
    private String name;
    private String description;
}
