package com.HeavenHomes.Heaven_Homes.common.dto;

import com.HeavenHomes.Heaven_Homes.common.enums.Amenity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomPriceResponseDto {
    private Long id;
    private String type;
    private String[] photos;
    private Set<Amenity> amenities;
    private Double price;
}
