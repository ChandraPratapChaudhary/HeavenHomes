package com.HeavenHomes.Heaven_Homes.common.config;

import com.HeavenHomes.Heaven_Homes.pricing.service.PricingUpdateService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class TableColumnFixer {

    private final JdbcTemplate jdbcTemplate;
    private final PricingUpdateService pricingUpdateService;

    @PostConstruct
    public void fixColumnTypes() {
        try {
            log.info("Ensuring PostgreSQL photo_url columns are TEXT type for Base64 media storage...");
            jdbcTemplate.execute("ALTER TABLE hotel_photos ALTER COLUMN photo_url TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE hotel_photos ALTER COLUMN photos_order DROP NOT NULL");
            log.info("Successfully updated hotel_photos schema");
        } catch (Exception e) { log.info("Note on hotel_photos schema: {}", e.getMessage()); }

        try {
            jdbcTemplate.execute("ALTER TABLE room_photos ALTER COLUMN photo_url TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE room_photos ALTER COLUMN photos_order DROP NOT NULL");
            log.info("Successfully updated room_photos schema");
        } catch (Exception e) { log.info("Note on room_photos schema: {}", e.getMessage()); }

        try {
            log.info("Ensuring PostgreSQL user roles tables and columns exist...");
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS user_roles (user_id bigint, app_user_id bigint, roles varchar(255))");
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS app_user_roles (user_id bigint, app_user_id bigint, roles varchar(255))");
            jdbcTemplate.execute("ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS user_id bigint");
            jdbcTemplate.execute("ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS app_user_id bigint");
            jdbcTemplate.execute("ALTER TABLE app_user_roles ADD COLUMN IF NOT EXISTS user_id bigint");
            jdbcTemplate.execute("ALTER TABLE app_user_roles ADD COLUMN IF NOT EXISTS app_user_id bigint");
            jdbcTemplate.execute("ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_roles_check");
            jdbcTemplate.execute("ALTER TABLE app_user_roles DROP CONSTRAINT IF EXISTS app_user_roles_roles_check");
            jdbcTemplate.execute("ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check");
            jdbcTemplate.execute("ALTER TABLE app_user_roles DROP CONSTRAINT IF EXISTS app_user_roles_role_check");
            jdbcTemplate.execute("INSERT INTO user_roles (user_id, app_user_id, roles) SELECT id, id, 'GUEST' FROM app_user ON CONFLICT DO NOTHING");
            jdbcTemplate.execute("INSERT INTO app_user_roles (user_id, app_user_id, roles) SELECT id, id, 'GUEST' FROM app_user ON CONFLICT DO NOTHING");
        } catch (Exception e) { log.info("Note on user_roles schema: {}", e.getMessage()); }

        CompletableFuture.runAsync(() -> {
            try {
                log.info("Indexing hotel prices for search in background...");
                pricingUpdateService.updatePrices();
                log.info("Successfully updated hotel search price index in background");
            } catch (Exception e) { log.warn("Price indexing note: {}", e.getMessage()); }
        });
    }
}
