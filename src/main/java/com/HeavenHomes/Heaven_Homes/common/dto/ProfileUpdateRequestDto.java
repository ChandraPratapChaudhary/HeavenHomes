package com.HeavenHomes.Heaven_Homes.common.dto;

import com.HeavenHomes.Heaven_Homes.common.enums.Gender;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ProfileUpdateRequestDto {
    private String name;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private Gender gender;
}
