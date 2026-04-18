package com.airline.dto;

import com.airline.model.Cargo;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

public class CargoDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String description;
        private Double weight;
        private Double volume;
        private String origin;
        private String destination;
        private Cargo.CargoPriority priority;
        private String customerName;
        private String customerContact;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String trackingNumber;
        private String description;
        private Double weight;
        private Double volume;
        private String origin;
        private String destination;
        private Cargo.CargoPriority priority;
        private Cargo.CargoStatus status;
        private String customerName;
        private String customerContact;
        private Long flightId;
        private String flightNumber;
        private LocalDateTime createdAt;
    }
}
