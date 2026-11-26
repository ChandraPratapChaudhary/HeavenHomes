package com.HeavenHomes.Heaven_Homes.pricing.strategy;
import com.HeavenHomes.Heaven_Homes.inventory.entity.Inventory;
import com.HeavenHomes.Heaven_Homes.pricing.service.HolidayService;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
@RequiredArgsConstructor
public class HolidayPricingStrategy implements PricingStrategy {
    private final PricingStrategy wrapped;
    private final HolidayService holidayService;
    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
        BigDecimal price = wrapped.calculatePrice(inventory);
        if (holidayService.isHoliday(inventory.getDate()))
            price = price.multiply(BigDecimal.valueOf(1.15));
        return price;
    }
}
