package com.HeavenHomes.Heaven_Homes.common.config;

import com.HeavenHomes.Heaven_Homes.booking.entity.Booking;
import com.HeavenHomes.Heaven_Homes.common.dto.BookingDto;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        modelMapper.addMappings(new PropertyMap<Booking, BookingDto>() {
            @Override
            protected void configure() {
                map().setHotelName(source.getHotel().getName());
                map().setRoomType(source.getRoom().getType());
            }
        });

        return modelMapper;
    }
}
