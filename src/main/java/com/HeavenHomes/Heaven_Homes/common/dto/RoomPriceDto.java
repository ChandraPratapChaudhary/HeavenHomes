package com.HeavenHomes.Heaven_Homes.common.dto;

import com.HeavenHomes.Heaven_Homes.room.entity.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomPriceDto {
    private Room room;
    private Double price;
}
