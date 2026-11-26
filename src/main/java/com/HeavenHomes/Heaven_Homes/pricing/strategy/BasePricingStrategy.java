package com.HeavenHomes.Heaven_Homes.pricing.strategy;
import com.HeavenHomes.Heaven_Homes.inventory.entity.Inventory;
import java.math.BigDecimal;
public class BasePricingStrategy implements PricingStrategy {
    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
        return inventory.getRoom().getBasePrice();
    }
}
