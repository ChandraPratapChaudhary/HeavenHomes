package com.HeavenHomes.Heaven_Homes.pricing.service;

import com.HeavenHomes.Heaven_Homes.inventory.entity.Inventory;
import com.HeavenHomes.Heaven_Homes.pricing.strategy.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingService {
    private final HolidayService holidayService;

    public BigDecimal calculateDynamicPricing(Inventory inventory) {
        PricingStrategy strategy = new BasePricingStrategy();
        strategy = new SurgePricingStrategy(strategy);
        strategy = new OccupancyPricingStrategy(strategy);
        strategy = new UrgencyPricingStrategy(strategy);
        strategy = new HolidayPricingStrategy(strategy, holidayService);
        return strategy.calculatePrice(inventory);
    }

    public BigDecimal calculateTotalPrice(List<Inventory> inventoryList) {
        return inventoryList.stream().map(this::calculateDynamicPricing).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
