package com.HeavenHomes.Heaven_Homes.common.dto;

import com.HeavenHomes.Heaven_Homes.common.enums.Gender;
import com.HeavenHomes.Heaven_Homes.common.enums.Role;
import lombok.Data;
import java.time.LocalDate;
import java.util.Set;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private String phoneNumber;
    private Gender gender;
    private LocalDate dateOfBirth;
    private Set<Role> roles;
}
