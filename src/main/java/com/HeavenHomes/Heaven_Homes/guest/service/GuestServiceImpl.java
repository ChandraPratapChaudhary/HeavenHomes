package com.HeavenHomes.Heaven_Homes.guest.service;

import com.HeavenHomes.Heaven_Homes.common.dto.GuestDto;
import com.HeavenHomes.Heaven_Homes.common.exception.ResourceNotFoundException;
import com.HeavenHomes.Heaven_Homes.guest.entity.Guest;
import com.HeavenHomes.Heaven_Homes.guest.repository.GuestRepository;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;
import static com.HeavenHomes.Heaven_Homes.common.util.AppUtils.getCurrentUser;

@Service @RequiredArgsConstructor @Slf4j
public class GuestServiceImpl implements GuestService {
    private final GuestRepository guestRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<GuestDto> getAllGuests() {
        User u = getCurrentUser();
        List<Guest> guests = guestRepository.findByUser(u);
        if (guests.isEmpty() && u.getName() != null && !u.getName().isBlank()) {
            Guest self = Guest.builder().name(u.getName()).phoneNumber(u.getPhoneNumber()).gender(u.getGender()).dateOfBirth(u.getDateOfBirth()).user(u).build();
            guests = new ArrayList<>(List.of(guestRepository.save(self)));
        }
        return guests.stream().map(g -> modelMapper.map(g, GuestDto.class)).collect(Collectors.toList());
    }

    @Override
    public GuestDto addNewGuest(GuestDto dto) {
        User u = getCurrentUser(); Guest g = modelMapper.map(dto, Guest.class); g.setUser(u);
        return modelMapper.map(guestRepository.save(g), GuestDto.class);
    }

    @Override @Transactional
    public void updateGuest(Long guestId, GuestDto dto) {
        Guest g = guestRepository.findById(guestId).orElseThrow(() -> new ResourceNotFoundException("Guest not found: " + guestId));
        User u = getCurrentUser();
        if (g.getUser() == null || !u.getId().equals(g.getUser().getId())) throw new AccessDeniedException("You are not the owner of this guest");
        modelMapper.map(dto, g); g.setUser(u); g.setId(guestId); guestRepository.save(g);
    }

    @Override @Transactional
    public void deleteGuest(Long guestId) {
        Guest g = guestRepository.findById(guestId).orElseThrow(() -> new ResourceNotFoundException("Guest not found: " + guestId));
        User u = getCurrentUser();
        if (g.getUser() == null || !u.getId().equals(g.getUser().getId())) throw new AccessDeniedException("You are not the owner of this guest");
        guestRepository.deleteFromBookingGuests(guestId); guestRepository.deleteById(guestId);
    }
}
