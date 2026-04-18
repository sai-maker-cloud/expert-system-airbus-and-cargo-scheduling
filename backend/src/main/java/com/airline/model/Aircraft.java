package com.airline.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "aircraft")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Aircraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", nullable = false, unique = true)
    private String registrationNumber;

    @Column(nullable = false)
    private String model;

    @Column(name = "max_cargo_weight", nullable = false)
    private Double maxCargoWeight;

    @Column(name = "max_cargo_volume", nullable = false)
    private Double maxCargoVolume;

    @Column(name = "passenger_capacity", nullable = false)
    private Integer passengerCapacity;

    @Column(name = "fuel_efficiency", nullable = false)
    private Double fuelEfficiency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AircraftStatus status = AircraftStatus.AVAILABLE;

    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;

    @Column(name = "next_maintenance_date")
    private LocalDate nextMaintenanceDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum AircraftStatus {
        AVAILABLE, IN_FLIGHT, MAINTENANCE, RETIRED
    }
}
