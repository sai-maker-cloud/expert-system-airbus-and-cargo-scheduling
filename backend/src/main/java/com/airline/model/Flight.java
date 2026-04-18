package com.airline.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "flights")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "flight_number", nullable = false, unique = true)
    private String flightNumber;

    @Column(nullable = false, length = 10)
    private String origin;

    @Column(nullable = false, length = 10)
    private String destination;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "arrival_time", nullable = false)
    private LocalDateTime arrivalTime;

    @Column(name = "distance_km", nullable = false)
    private Double distanceKm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FlightStatus status = FlightStatus.SCHEDULED;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aircraft_id")
    private Aircraft aircraft;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "flight_crew",
        joinColumns = @JoinColumn(name = "flight_id"),
        inverseJoinColumns = @JoinColumn(name = "crew_member_id")
    )
    private List<CrewMember> crewMembers = new ArrayList<>();

    @OneToMany(mappedBy = "flight", fetch = FetchType.LAZY)
    private List<Cargo> cargoList = new ArrayList<>();

    @Column(name = "delay_minutes")
    private Integer delayMinutes = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public double getDurationHours() {
        return java.time.Duration.between(departureTime, arrivalTime).toMinutes() / 60.0;
    }

    public double getAssignedCargoWeight() {
        return cargoList.stream().mapToDouble(Cargo::getWeight).sum();
    }

    public double getAssignedCargoVolume() {
        return cargoList.stream().mapToDouble(Cargo::getVolume).sum();
    }

    public enum FlightStatus {
        SCHEDULED, BOARDING, IN_FLIGHT, LANDED, DELAYED, CANCELLED
    }
}
