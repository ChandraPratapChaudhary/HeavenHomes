package com.HeavenHomes.Heaven_Homes.common.dto;

import com.HeavenHomes.Heaven_Homes.common.enums.Amenity;
import com.HeavenHomes.Heaven_Homes.hotel.entity.HotelContactInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HotelPriceResponseDto {
    private Long id;
    private String name;
    private String city;
    private String[] photos;
    private Set<Amenity> amenities;
    private HotelContactInfo contactInfo;
    private Double price;
}
