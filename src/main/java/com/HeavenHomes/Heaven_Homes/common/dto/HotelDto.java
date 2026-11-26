package com.HeavenHomes.Heaven_Homes.common.dto;

import com.HeavenHomes.Heaven_Homes.common.enums.Amenity;
import com.HeavenHomes.Heaven_Homes.hotel.entity.HotelContactInfo;
import lombok.Data;
import java.util.List;
import java.util.Set;

@Data
public class HotelDto {
    private Long id;
    private String name;
    private String city;
    private List<String> photos;
    private Set<Amenity> amenities;
    private HotelContactInfo contactInfo;
    private Boolean active;
}
