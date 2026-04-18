package com.airline.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "crew_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrewMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false, unique = true)
    private String employeeId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CrewRole role;

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "license_expiry")
    private LocalDate licenseExpiry;

    @Column(name = "hours_flown_today")
    private Double hoursFlownToday = 0.0;

    @Column(name = "total_hours_flown")
    private Double totalHoursFlown = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CrewStatus status = CrewStatus.AVAILABLE;

    @Column(name = "base_station", nullable = false)
    private String baseStation;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public enum CrewRole {
        PILOT, CO_PILOT, FLIGHT_ENGINEER, FLIGHT_ATTENDANT, PURSER
    }

    public enum CrewStatus {
        AVAILABLE, ON_DUTY, OFF_DUTY, ON_LEAVE
    }
}
