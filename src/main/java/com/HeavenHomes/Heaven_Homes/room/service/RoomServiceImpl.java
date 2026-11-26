package com.HeavenHomes.Heaven_Homes.room.service;

import com.HeavenHomes.Heaven_Homes.common.dto.RoomDto;
import com.HeavenHomes.Heaven_Homes.common.enums.Role;
import com.HeavenHomes.Heaven_Homes.common.exception.ResourceNotFoundException;
import com.HeavenHomes.Heaven_Homes.common.exception.UnAuthorisedException;
import com.HeavenHomes.Heaven_Homes.hotel.entity.Hotel;
import com.HeavenHomes.Heaven_Homes.hotel.repository.HotelRepository;
import com.HeavenHomes.Heaven_Homes.hotel.service.FileStorageService;
import com.HeavenHomes.Heaven_Homes.inventory.service.InventoryService;
import com.HeavenHomes.Heaven_Homes.pricing.service.PricingUpdateService;
import com.HeavenHomes.Heaven_Homes.room.entity.Room;
import com.HeavenHomes.Heaven_Homes.room.repository.RoomRepository;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import com.HeavenHomes.Heaven_Homes.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import static com.HeavenHomes.Heaven_Homes.common.util.AppUtils.getCurrentUser;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomServiceImpl implements RoomService {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final InventoryService inventoryService;
    private final FileStorageService fileStorageService;
    private final PricingUpdateService pricingUpdateService;
    private final ModelMapper modelMapper;

    @Override @Transactional
    public RoomDto createNewRoom(Long hotelId, RoomDto roomDto) {
        log.info("Creating a new room in hotel with ID: {}", hotelId);
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));
        User user = getCurrentUser();
        if (!isOwnerOrSuperAdmin(hotel, user)) throw new UnAuthorisedException("This user does not own this hotel with id: " + hotelId);
        Room room = new Room();
        room.setHotel(hotel); room.setType(roomDto.getType()); room.setBasePrice(roomDto.getBasePrice());
        room.setTotalCount(roomDto.getTotalCount()); room.setCapacity(roomDto.getCapacity());
        room.setPhotos(roomDto.getPhotos() != null ? roomDto.getPhotos() : new ArrayList<>());
        room.setAmenities(roomDto.getAmenities() != null ? roomDto.getAmenities() : new HashSet<>());
        room = roomRepository.save(room);
        if (Boolean.TRUE.equals(hotel.getActive())) {
            inventoryService.initializeRoomForAYear(room);
            pricingUpdateService.updateHotelPrices(hotel);
        }
        RoomDto dto = new RoomDto();
        dto.setId(room.getId()); dto.setType(room.getType()); dto.setBasePrice(room.getBasePrice());
        dto.setTotalCount(room.getTotalCount()); dto.setCapacity(room.getCapacity());
        dto.setPhotos(room.getPhotos()); dto.setAmenities(room.getAmenities());
        return dto;
    }

    @Override @Transactional
    public List<RoomDto> getAllRoomsInHotel(Long hotelId) {
        log.info("Getting all rooms in hotel with ID: {}", hotelId);
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));
        User user = getCurrentUser();
        if (!isOwnerOrSuperAdmin(hotel, user)) throw new UnAuthorisedException("This user does not own this hotel with id: " + hotelId);
        return roomRepository.findByHotel(hotel).stream()
                .map(element -> modelMapper.map(element, RoomDto.class))
                .collect(Collectors.toList());
    }

    @Override @Transactional
    public RoomDto getRoomById(Long roomId) {
        log.info("Getting the room with ID: {}", roomId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));
        return modelMapper.map(room, RoomDto.class);
    }

    @Override @Transactional
    public void deleteRoomById(Long roomId) {
        log.info("Deleting the room with ID: {}", roomId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));
        User user = getCurrentUser();
        if (!isOwnerOrSuperAdmin(room.getHotel(), user)) throw new UnAuthorisedException("This user does not own the hotel for room with id: " + roomId);
        inventoryService.deleteAllInventories(room);
        roomRepository.deleteById(roomId);
    }

    @Override @Transactional
    public RoomDto updateRoomById(Long hotelId, Long roomId, RoomDto roomDto) {
        log.info("Updating the room with ID: {}", roomId);
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));
        User user = getCurrentUser();
        if (!isOwnerOrSuperAdmin(hotel, user)) throw new UnAuthorisedException("This user does not own this hotel with id: " + hotelId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));
        modelMapper.map(roomDto, room); room.setId(roomId);
        return modelMapper.map(roomRepository.save(room), RoomDto.class);
    }

    @Override @Transactional
    public RoomDto uploadRoomPhoto(Long hotelId, Long roomId, MultipartFile file) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));
        User user = getCurrentUser();
        if (!isOwnerOrSuperAdmin(hotel, user)) throw new UnAuthorisedException("This user does not own this hotel with id: " + hotelId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));
        String photoUrl = fileStorageService.storeFile(file);
        List<String> updatedPhotos = new ArrayList<>();
        if (room.getPhotos() != null) updatedPhotos.addAll(room.getPhotos());
        updatedPhotos.add(photoUrl); room.setPhotos(updatedPhotos); room = roomRepository.save(room);
        RoomDto dto = new RoomDto();
        dto.setId(room.getId()); dto.setType(room.getType()); dto.setBasePrice(room.getBasePrice());
        dto.setTotalCount(room.getTotalCount()); dto.setCapacity(room.getCapacity());
        dto.setPhotos(room.getPhotos()); dto.setAmenities(room.getAmenities());
        return dto;
    }

    @Override @Transactional
    public RoomDto deleteRoomPhoto(Long hotelId, Long roomId, String photoUrl) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));
        User user = getCurrentUser();
        if (!isOwnerOrSuperAdmin(hotel, user)) throw new UnAuthorisedException("This user does not own this hotel with id: " + hotelId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));
        if (room.getPhotos() != null) {
            List<String> updatedPhotos = new ArrayList<>(room.getPhotos());
            if (updatedPhotos.remove(photoUrl)) { fileStorageService.deleteFile(photoUrl); room.setPhotos(updatedPhotos); room = roomRepository.save(room); }
        }
        RoomDto dto = new RoomDto();
        dto.setId(room.getId()); dto.setType(room.getType()); dto.setBasePrice(room.getBasePrice());
        dto.setTotalCount(room.getTotalCount()); dto.setCapacity(room.getCapacity());
        dto.setPhotos(room.getPhotos()); dto.setAmenities(room.getAmenities());
        return dto;
    }

    private boolean isOwnerOrSuperAdmin(Hotel hotel, User user) {
        if (user == null || hotel == null) return false;
        if (user.getRoles() != null && user.getRoles().contains(Role.SUPER_ADMIN)) return true;
        return hotel.getOwner() != null && user.getId().equals(hotel.getOwner().getId());
    }
}
