package com.HeavenHomes.Heaven_Homes.common.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewDto {
    private Long id;
    private Integer rating;
    private String comment;
    private String reviewerName;
    private String reviewerEmail;
    private LocalDateTime createdAt;
}
