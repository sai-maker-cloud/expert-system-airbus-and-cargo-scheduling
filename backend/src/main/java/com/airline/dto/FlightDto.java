package com.airline.dto;

import com.airline.model.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

public class FlightDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String flightNumber;
        private String origin;
        private String destination;
        private LocalDateTime departureTime;
        private LocalDateTime arrivalTime;
        private Double distanceKm;
        private Long aircraftId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String flightNumber;
        private String origin;
        private String destination;
        private LocalDateTime departureTime;
        private LocalDateTime arrivalTime;
        private Double distanceKm;
        private Flight.FlightStatus status;
        private AircraftDto.Summary aircraft;
        private List<CrewDto.Summary> crewMembers;
        private Integer crewCount;
        private Double totalCargoWeight;
        private Double availableCargoCapacity;
        private Integer delayMinutes;
        private LocalDateTime createdAt;
    }
}
