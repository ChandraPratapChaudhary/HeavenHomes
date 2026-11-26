package com.HeavenHomes.Heaven_Homes.pricing.strategy;
import com.HeavenHomes.Heaven_Homes.inventory.entity.Inventory;
import java.math.BigDecimal;
public interface PricingStrategy {
    BigDecimal calculatePrice(Inventory inventory);
}
