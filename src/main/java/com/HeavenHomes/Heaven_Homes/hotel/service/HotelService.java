package com.HeavenHomes.Heaven_Homes.hotel.service;

import com.HeavenHomes.Heaven_Homes.common.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface HotelService {
    HotelDto createNewHotel(HotelDto hotelDto);
    HotelDto getHotelById(Long id);
    HotelDto updateHotelById(Long id, HotelDto hotelDto);
    void deleteHotelById(Long id);
    void activateHotel(Long hotelId);
    HotelInfoDto getHotelInfoById(Long hotelId, HotelInfoRequestDto hotelInfoRequestDto);
    Page<HotelDto> getAllHotels(Pageable pageable);
    HotelDto uploadHotelPhoto(Long hotelId, MultipartFile file);
    HotelDto deleteHotelPhoto(Long hotelId, String photoUrl);
    List<String> getAllActiveCities();
}
