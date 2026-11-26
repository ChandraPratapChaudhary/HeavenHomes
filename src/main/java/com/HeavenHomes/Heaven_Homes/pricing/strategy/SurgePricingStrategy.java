package com.HeavenHomes.Heaven_Homes.pricing.strategy;
import com.HeavenHomes.Heaven_Homes.inventory.entity.Inventory;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
@RequiredArgsConstructor
public class SurgePricingStrategy implements PricingStrategy {
    private final PricingStrategy wrapped;
    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
        return wrapped.calculatePrice(inventory).multiply(inventory.getSurgeFactor());
    }
}
