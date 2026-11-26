package com.HeavenHomes.Heaven_Homes.pricing.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HolidayService {
    private static final String HOLIDAY_API_URL = "https://date.nager.at/api/v3/PublicHolidays/%d/IN";
    private final RestClient restClient;
    private final Map<Integer, Set<LocalDate>> holidaysByYear = new ConcurrentHashMap<>();

    @PostConstruct
    public void loadInitialHolidays() {
        int y = LocalDate.now().getYear();
        loadHolidaysForYear(y);
        loadHolidaysForYear(y + 1);
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void refreshHolidays() { loadInitialHolidays(); }

    public boolean isHoliday(LocalDate date) {
        Set<LocalDate> holidays = holidaysByYear.get(date.getYear());
        if (holidays == null) holidays = loadHolidaysForYear(date.getYear());
        return holidays.contains(date);
    }

    private Set<LocalDate> loadHolidaysForYear(int year) {
        try {
            NagerHolidayDto[] response = restClient.get().uri(String.format(HOLIDAY_API_URL, year)).retrieve().body(NagerHolidayDto[].class);
            Set<LocalDate> dates = response == null ? Collections.emptySet() : Arrays.stream(response).map(NagerHolidayDto::getDate).filter(Objects::nonNull).map(LocalDate::parse).collect(Collectors.toSet());
            holidaysByYear.put(year, dates);
            log.info("Loaded {} public holidays for {}", dates.size(), year);
            return dates;
        } catch (Exception e) {
            log.warn("Could not fetch holidays for {} ({}). Falling back.", year, e.getMessage());
            Set<LocalDate> fallback = Set.of(LocalDate.of(year, 1, 26), LocalDate.of(year, 8, 15), LocalDate.of(year, 10, 2));
            holidaysByYear.put(year, fallback);
            return fallback;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class NagerHolidayDto {
        private String date;
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
    }
}
