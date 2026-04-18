package com.airline.dto;

import com.airline.model.Aircraft;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AircraftDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String registrationNumber;
        private String model;
        private Double maxCargoWeight;
        private Double maxCargoVolume;
        private Integer passengerCapacity;
        private Double fuelEfficiency;
        private LocalDate lastMaintenanceDate;
        private LocalDate nextMaintenanceDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String registrationNumber;
        private String model;
        private Double maxCargoWeight;
        private Double maxCargoVolume;
        private Integer passengerCapacity;
        private Double fuelEfficiency;
        private Aircraft.AircraftStatus status;
        private LocalDate lastMaintenanceDate;
        private LocalDate nextMaintenanceDate;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private Long id;
        private String registrationNumber;
        private String model;
        private Aircraft.AircraftStatus status;
        private Double maxCargoWeight;
    }
}
