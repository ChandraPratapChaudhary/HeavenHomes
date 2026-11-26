package com.HeavenHomes.Heaven_Homes.room.entity;

import com.HeavenHomes.Heaven_Homes.common.enums.Amenity;
import com.HeavenHomes.Heaven_Homes.hotel.entity.Hotel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Getter
@Setter
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;
    @Column(nullable = false)
    private String type;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "room_photos", joinColumns = @JoinColumn(name = "room_id"))
    @OrderColumn(name = "photos_order")
    @Column(name = "photo_url", columnDefinition = "TEXT")
    private List<String> photos = new ArrayList<>();
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "room_amenities", joinColumns = @JoinColumn(name = "room_id"))
    private Set<Amenity> amenities;
    @Column(nullable = false)
    private Integer totalCount;
    @Column(nullable = false)
    private Integer capacity;
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
