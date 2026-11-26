package com.HeavenHomes.Heaven_Homes.pricing.strategy;
import com.HeavenHomes.Heaven_Homes.inventory.entity.Inventory;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
@RequiredArgsConstructor
public class OccupancyPricingStrategy implements PricingStrategy {
    private final PricingStrategy wrapped;
    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
        BigDecimal price = wrapped.calculatePrice(inventory);
        if (inventory.getTotalCount() == null || inventory.getTotalCount() == 0) return price;
        double occupancyRate = (double) inventory.getBookedCount() / inventory.getTotalCount();
        if (occupancyRate > 0.8) price = price.multiply(BigDecimal.valueOf(1.10));
        return price;
    }
}
