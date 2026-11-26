package com.HeavenHomes.Heaven_Homes.hotel.entity;

import com.HeavenHomes.Heaven_Homes.common.enums.Amenity;
import com.HeavenHomes.Heaven_Homes.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Getter
@Setter
@Table(name = "hotel")
public class Hotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    private String city;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "hotel_photos", joinColumns = @JoinColumn(name = "hotel_id"))
    @OrderColumn(name = "photos_order")
    @Column(name = "photo_url", columnDefinition = "TEXT")
    private List<String> photos = new ArrayList<>();
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "hotel_amenities", joinColumns = @JoinColumn(name = "hotel_id"))
    private Set<Amenity> amenities;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    @Embedded
    private HotelContactInfo contactInfo;
    @Column(nullable = false)
    private Boolean active;
    @ManyToOne(optional = false)
    private User owner;
}
