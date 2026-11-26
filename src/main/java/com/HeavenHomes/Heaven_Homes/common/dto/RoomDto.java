package com.HeavenHomes.Heaven_Homes.common.dto;

import com.HeavenHomes.Heaven_Homes.common.enums.Amenity;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class RoomDto {
    private Long id;
    private String type;
    private BigDecimal basePrice;
    private List<String> photos;
    private Set<Amenity> amenities;
    private Integer totalCount;
    private Integer capacity;
}
