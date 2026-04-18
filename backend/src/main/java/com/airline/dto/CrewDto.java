package com.airline.dto;

import com.airline.model.CrewMember;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class CrewDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String employeeId;
        private String firstName;
        private String lastName;
        private CrewMember.CrewRole role;
        private String licenseNumber;
        private LocalDate licenseExpiry;
        private String baseStation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String employeeId;
        private String firstName;
        private String lastName;
        private String fullName;
        private CrewMember.CrewRole role;
        private String licenseNumber;
        private LocalDate licenseExpiry;
        private Double hoursFlownToday;
        private Double totalHoursFlown;
        private CrewMember.CrewStatus status;
        private String baseStation;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private Long id;
        private String employeeId;
        private String fullName;
        private CrewMember.CrewRole role;
        private CrewMember.CrewStatus status;
    }
}
