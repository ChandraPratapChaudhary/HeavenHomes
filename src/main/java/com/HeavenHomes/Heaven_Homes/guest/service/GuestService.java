package com.HeavenHomes.Heaven_Homes.guest.service;
import com.HeavenHomes.Heaven_Homes.common.dto.GuestDto;
import java.util.List;
public interface GuestService {
    List<GuestDto> getAllGuests();
    void updateGuest(Long guestId, GuestDto guestDto);
    void deleteGuest(Long guestId);
    GuestDto addNewGuest(GuestDto guestDto);
}
