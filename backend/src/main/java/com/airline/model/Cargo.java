package com.airline.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "cargo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_number", nullable = false, unique = true)
    private String trackingNumber;

    @Column(length = 200)
    private String description;

    @Column(nullable = false)
    private Double weight;

    @Column(nullable = false)
    private Double volume;

    @Column(nullable = false, length = 10)
    private String origin;

    @Column(nullable = false, length = 10)
    private String destination;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CargoPriority priority = CargoPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CargoStatus status = CargoStatus.PENDING;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_contact")
    private String customerContact;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flight_id")
    private Flight flight;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_cargo_id")
    private Cargo parentCargo;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public int getPriorityScore() {
        return switch (priority) {
            case CRITICAL -> 4;
            case HIGH -> 3;
            case MEDIUM -> 2;
            case LOW -> 1;
        };
    }

    public enum CargoPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum CargoStatus {
        PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, SPLIT
    }
}
