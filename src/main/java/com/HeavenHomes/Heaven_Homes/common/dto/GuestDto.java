package com.HeavenHomes.Heaven_Homes.common.dto;

import com.HeavenHomes.Heaven_Homes.common.enums.Gender;
import lombok.Data;
import java.time.LocalDate;

@Data
public class GuestDto {
    private Long id;
    private String name;
    private String phoneNumber;
    private Gender gender;
    private LocalDate dateOfBirth;
}
