package com.HeavenHomes.Heaven_Homes.hotel.service;

import com.HeavenHomes.Heaven_Homes.common.dto.*;
import com.HeavenHomes.Heaven_Homes.common.enums.Role;
import com.HeavenHomes.Heaven_Homes.common.exception.ResourceNotFoundException;
import com.HeavenHomes.Heaven_Homes.common.exception.UnAuthorisedException;
import com.HeavenHomes.Heaven_Homes.hotel.entity.Hotel;
import com.HeavenHomes.Heaven_Homes.hotel.repository.HotelMinPriceRepository;
import com.HeavenHomes.Heaven_Homes.hotel.repository.HotelRepository;
import com.HeavenHomes.Heaven_Homes.inventory.entity.Inventory;
import com.HeavenHomes.Heaven_Homes.inventory.repository.InventoryRepository;
import com.HeavenHomes.Heaven_Homes.inventory.service.InventoryService;
import com.HeavenHomes.Heaven_Homes.pricing.service.PricingService;
import com.HeavenHomes.Heaven_Homes.pricing.service.PricingUpdateService;
import com.HeavenHomes.Heaven_Homes.room.entity.Room;
import com.HeavenHomes.Heaven_Homes.room.repository.RoomRepository;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import com.HeavenHomes.Heaven_Homes.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import static com.HeavenHomes.Heaven_Homes.common.util.AppUtils.getCurrentUser;

@Service
@Slf4j
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final ModelMapper modelMapper;
    private final InventoryService inventoryService;
    private final RoomRepository roomRepository;
    private final InventoryRepository inventoryRepository;
    private final PricingUpdateService pricingUpdateService;
    private final PricingService pricingService;
    private final FileStorageService fileStorageService;
    private final HotelMinPriceRepository hotelMinPriceRepository;

    @Override @Transactional
    public HotelDto createNewHotel(HotelDto hotelDto) {
        log.info("Creating hotel: {}", hotelDto.getName());
        User principal = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User managedUser = userRepository.findById(principal.getId()).orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + principal.getId()));
        Hotel hotel = new Hotel();
        hotel.setName(hotelDto.getName()); hotel.setCity(hotelDto.getCity());
        hotel.setPhotos(hotelDto.getPhotos() != null ? hotelDto.getPhotos() : new ArrayList<>());
        hotel.setAmenities(hotelDto.getAmenities() != null ? hotelDto.getAmenities() : new HashSet<>());
        hotel.setContactInfo(hotelDto.getContactInfo()); hotel.setActive(false); hotel.setOwner(managedUser);
        hotel = hotelRepository.save(hotel);
        HotelDto dto = new HotelDto(); dto.setId(hotel.getId()); dto.setName(hotel.getName()); dto.setCity(hotel.getCity());
        dto.setPhotos(hotel.getPhotos()); dto.setAmenities(hotel.getAmenities()); dto.setContactInfo(hotel.getContactInfo()); dto.setActive(hotel.getActive());
        return dto;
    }

    @Override @Transactional
    public HotelDto getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));
        if (!isOwnerOrSuperAdmin(hotel, getCurrentUser())) throw new UnAuthorisedException("This user does not own this hotel with id: " + id);
        return modelMapper.map(hotel, HotelDto.class);
    }

    @Override @Transactional
    public HotelDto updateHotelById(Long id, HotelDto hotelDto) {
        Hotel hotel = hotelRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));
        if (!isOwnerOrSuperAdmin(hotel, getCurrentUser())) throw new UnAuthorisedException("This user does not own this hotel with id: " + id);
        modelMapper.map(hotelDto, hotel); hotel.setId(id); hotel = hotelRepository.save(hotel);
        return modelMapper.map(hotel, HotelDto.class);
    }

    @Override @Transactional
    public void deleteHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));
        if (!isOwnerOrSuperAdmin(hotel, getCurrentUser())) throw new UnAuthorisedException("This user does not own this hotel with id: " + id);
        for (Room room : roomRepository.findByHotel(hotel)) { inventoryService.deleteAllInventories(room); roomRepository.deleteById(room.getId()); }
        hotelRepository.deleteById(id);
    }

    @Override @Transactional
    public void activateHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));
        if (!isOwnerOrSuperAdmin(hotel, getCurrentUser())) throw new UnAuthorisedException("This user does not own this hotel with id: " + hotelId);
        boolean newStatus = !Boolean.TRUE.equals(hotel.getActive()); hotel.setActive(newStatus); hotel = hotelRepository.save(hotel);
        if (newStatus) { for (Room room : roomRepository.findByHotel(hotel)) inventoryService.initializeRoomForAYear(room); pricingUpdateService.updateHotelPrices(hotel); }
        else { hotelMinPriceRepository.deleteByHotel(hotel); }
    }

    @Override @Transactional
    public HotelInfoDto getHotelInfoById(Long hotelId, HotelInfoRequestDto req) {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));
        long daysCount = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;
        List<Inventory> avail = inventoryRepository.findAvailableInventoryForPricing(hotelId, req.getStartDate(), req.getEndDate(), req.getRoomsCount());
        Map<Room, List<Inventory>> byRoom = avail.stream().collect(Collectors.groupingBy(Inventory::getRoom));
        List<RoomPriceResponseDto> rooms = byRoom.entrySet().stream().filter(e -> e.getValue().size() == daysCount).map(e -> {
            double avg = e.getValue().stream().map(pricingService::calculateDynamicPricing).mapToDouble(BigDecimal::doubleValue).average().orElse(0.0);
            RoomPriceResponseDto dto = modelMapper.map(e.getKey(), RoomPriceResponseDto.class); dto.setPrice(avg); return dto;
        }).collect(Collectors.toList());
        return new HotelInfoDto(modelMapper.map(hotel, HotelDto.class), rooms);
    }

    @Override @Transactional
    public Page<HotelDto> getAllHotels(Pageable pageable) {
        return hotelRepository.findByOwner(getCurrentUser(), pageable).map(e -> modelMapper.map(e, HotelDto.class));
    }

    @Override @Transactional
    public HotelDto uploadHotelPhoto(Long hotelId, MultipartFile file) {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));
        if (!isOwnerOrSuperAdmin(hotel, getCurrentUser())) throw new UnAuthorisedException("This user does not own this hotel with id: " + hotelId);
        String photoUrl = fileStorageService.storeFile(file);
        List<String> photos = new ArrayList<>(); if (hotel.getPhotos() != null) photos.addAll(hotel.getPhotos()); photos.add(photoUrl);
        hotel.setPhotos(photos); hotel = hotelRepository.save(hotel);
        HotelDto dto = new HotelDto(); dto.setId(hotel.getId()); dto.setName(hotel.getName()); dto.setCity(hotel.getCity()); dto.setPhotos(hotel.getPhotos()); dto.setAmenities(hotel.getAmenities()); dto.setContactInfo(hotel.getContactInfo()); dto.setActive(hotel.getActive());
        return dto;
    }

    @Override @Transactional
    public HotelDto deleteHotelPhoto(Long hotelId, String photoUrl) {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));
        if (!isOwnerOrSuperAdmin(hotel, getCurrentUser())) throw new UnAuthorisedException("This user does not own this hotel with id: " + hotelId);
        if (hotel.getPhotos() != null) { List<String> photos = new ArrayList<>(hotel.getPhotos()); if (photos.remove(photoUrl)) { fileStorageService.deleteFile(photoUrl); hotel.setPhotos(photos); hotel = hotelRepository.save(hotel); } }
        HotelDto dto = new HotelDto(); dto.setId(hotel.getId()); dto.setName(hotel.getName()); dto.setCity(hotel.getCity()); dto.setPhotos(hotel.getPhotos()); dto.setAmenities(hotel.getAmenities()); dto.setContactInfo(hotel.getContactInfo()); dto.setActive(hotel.getActive());
        return dto;
    }

    @Override
    public List<String> getAllActiveCities() { return hotelRepository.findDistinctActiveCities(); }

    private boolean isOwnerOrSuperAdmin(Hotel hotel, User user) {
        if (user == null || hotel == null) return false;
        if (user.getRoles() != null && user.getRoles().contains(Role.SUPER_ADMIN)) return true;
        return hotel.getOwner() != null && user.getId().equals(hotel.getOwner().getId());
    }
}
