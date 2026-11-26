package com.HeavenHomes.Heaven_Homes.pricing.service;

import com.HeavenHomes.Heaven_Homes.hotel.entity.Hotel;
import com.HeavenHomes.Heaven_Homes.hotel.entity.HotelMinPrice;
import com.HeavenHomes.Heaven_Homes.hotel.repository.HotelMinPriceRepository;
import com.HeavenHomes.Heaven_Homes.hotel.repository.HotelRepository;
import com.HeavenHomes.Heaven_Homes.inventory.entity.Inventory;
import com.HeavenHomes.Heaven_Homes.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PricingUpdateService {
    private final HotelRepository hotelRepository;
    private final InventoryRepository inventoryRepository;
    private final HotelMinPriceRepository hotelMinPriceRepository;
    private final PricingService pricingService;

    @Scheduled(cron = "0 0 * * * *")
    public void updatePrices() {
        int page = 0;
        while (true) {
            Page<Hotel> hotelPage = hotelRepository.findAll(PageRequest.of(page, 100));
            if (hotelPage.isEmpty()) break;
            hotelPage.getContent().forEach(this::updateHotelPrices);
            page++;
        }
    }

    public void updateHotelPrices(Hotel hotel) {
        log.info("Updating prices for hotel ID: {}", hotel.getId());
        LocalDate start = LocalDate.now(), end = LocalDate.now().plusYears(1);
        List<Inventory> list = inventoryRepository.findByHotelAndDateBetween(hotel, start, end);
        list.forEach(inv -> inv.setPrice(pricingService.calculateDynamicPricing(inv)));
        inventoryRepository.saveAll(list);
        Map<LocalDate, BigDecimal> dailyMin = list.stream().collect(
            Collectors.groupingBy(Inventory::getDate, Collectors.mapping(Inventory::getPrice, Collectors.minBy(Comparator.naturalOrder())))
        ).entrySet().stream().collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().orElse(BigDecimal.ZERO)));
        List<HotelMinPrice> prices = new ArrayList<>();
        dailyMin.forEach((date, price) -> {
            HotelMinPrice hp = hotelMinPriceRepository.findByHotelAndDate(hotel, date).orElse(new HotelMinPrice(hotel, date));
            hp.setPrice(price);
            prices.add(hp);
        });
        hotelMinPriceRepository.saveAll(prices);
    }
}
