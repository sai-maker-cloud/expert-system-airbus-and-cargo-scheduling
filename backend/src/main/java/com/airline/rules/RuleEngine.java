package com.airline.rules;

import com.airline.model.*;
import com.airline.repository.SystemRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RuleEngine {

    private final SystemRuleRepository systemRuleRepository;

    public double getMaxCrewDutyHours() {
        return systemRuleRepository.findByRuleKey("MAX_CREW_DUTY_HOURS")
                .filter(r -> r.getIsActive())
                .map(r -> Double.parseDouble(r.getRuleValue()))
                .orElse(8.0);
    }

    public double getMinPilotRestHours() {
        return systemRuleRepository.findByRuleKey("MIN_PILOT_REST_HOURS")
                .filter(r -> r.getIsActive())
                .map(r -> Double.parseDouble(r.getRuleValue()))
                .orElse(10.0);
    }

    public double getMaxCargoWeightPercent() {
        return systemRuleRepository.findByRuleKey("MAX_CARGO_WEIGHT_PERCENT")
                .filter(r -> r.getIsActive())
                .map(r -> Double.parseDouble(r.getRuleValue()))
                .orElse(90.0);
    }

    public int getHighPriorityWindowHours() {
        return systemRuleRepository.findByRuleKey("HIGH_PRIORITY_WINDOW_HOURS")
                .filter(r -> r.getIsActive())
                .map(r -> Integer.parseInt(r.getRuleValue()))
                .orElse(4);
    }

    public int getMaintenanceBufferDays() {
        return systemRuleRepository.findByRuleKey("MAINTENANCE_BUFFER_DAYS")
                .filter(r -> r.getIsActive())
                .map(r -> Integer.parseInt(r.getRuleValue()))
                .orElse(3);
    }

    public int getMinCrewSize() {
        return systemRuleRepository.findByRuleKey("MIN_CREW_SIZE")
                .filter(r -> r.getIsActive())
                .map(r -> Integer.parseInt(r.getRuleValue()))
                .orElse(4);
    }

    public List<String> validateCrewAssignment(CrewMember crew, Flight flight) {
        List<String> violations = new ArrayList<>();
        double maxHours = getMaxCrewDutyHours();
        double flightDuration = flight.getDurationHours();

        if (crew.getStatus() != CrewMember.CrewStatus.AVAILABLE) {
            violations.add("Crew member " + crew.getFullName() + " is not available (status: " + crew.getStatus() + ")");
        }

        if (crew.getHoursFlownToday() + flightDuration > maxHours) {
            violations.add("Crew member " + crew.getFullName() + " would exceed max duty hours (" + maxHours + "h). Current: " + crew.getHoursFlownToday() + "h, Flight: " + flightDuration + "h");
        }

        if (flight.getCrewMembers().stream().anyMatch(c -> c.getId().equals(crew.getId()))) {
            violations.add("Crew member " + crew.getFullName() + " is already assigned to this flight");
        }

        if (crew.getLicenseExpiry() != null && crew.getLicenseExpiry().isBefore(LocalDate.now())) {
            violations.add("Crew member " + crew.getFullName() + " has an expired license");
        }

        return violations;
    }

    public List<String> validateAircraftAssignment(Aircraft aircraft, Flight flight) {
        List<String> violations = new ArrayList<>();

        if (aircraft.getStatus() != Aircraft.AircraftStatus.AVAILABLE) {
            violations.add("Aircraft " + aircraft.getRegistrationNumber() + " is not available (status: " + aircraft.getStatus() + ")");
        }

        if (flight.getAircraft() != null) {
            violations.add("Flight " + flight.getFlightNumber() + " already has an aircraft assigned");
        }

        if (aircraft.getNextMaintenanceDate() != null) {
            LocalDate maintenanceThreshold = LocalDate.now().plusDays(getMaintenanceBufferDays());
            if (aircraft.getNextMaintenanceDate().isBefore(maintenanceThreshold)) {
                violations.add("Aircraft " + aircraft.getRegistrationNumber() + " is approaching scheduled maintenance on " + aircraft.getNextMaintenanceDate());
            }
        }

        return violations;
    }

    public List<String> validateCargoAssignment(Cargo cargo, Flight flight) {
        List<String> violations = new ArrayList<>();
        double maxWeightPercent = getMaxCargoWeightPercent() / 100.0;

        if (flight.getAircraft() == null) {
            violations.add("Flight " + flight.getFlightNumber() + " has no aircraft assigned");
            return violations;
        }

        if (cargo.getStatus() != Cargo.CargoStatus.PENDING) {
            violations.add("Cargo " + cargo.getTrackingNumber() + " is not in PENDING status");
        }

        if (!cargo.getDestination().equals(flight.getDestination())) {
            violations.add("Cargo destination " + cargo.getDestination() + " does not match flight destination " + flight.getDestination());
        }

        double currentWeight = flight.getAssignedCargoWeight();
        double maxAllowedWeight = flight.getAircraft().getMaxCargoWeight() * maxWeightPercent;

        if (currentWeight + cargo.getWeight() > maxAllowedWeight) {
            violations.add("Adding cargo would exceed aircraft weight capacity. Available: " + (maxAllowedWeight - currentWeight) + "kg, Required: " + cargo.getWeight() + "kg");
        }

        double currentVolume = flight.getAssignedCargoVolume();
        double maxVolume = flight.getAircraft().getMaxCargoVolume();
        if (currentVolume + cargo.getVolume() > maxVolume) {
            violations.add("Adding cargo would exceed aircraft volume capacity. Available: " + (maxVolume - currentVolume) + "m³, Required: " + cargo.getVolume() + "m³");
        }

        return violations;
    }

    public boolean isFlightReadyForDeparture(Flight flight) {
        if (flight.getAircraft() == null) return false;
        if (flight.getCrewMembers().size() < getMinCrewSize()) return false;
        boolean hasPilot = flight.getCrewMembers().stream().anyMatch(c -> c.getRole() == CrewMember.CrewRole.PILOT);
        boolean hasCoPilot = flight.getCrewMembers().stream().anyMatch(c -> c.getRole() == CrewMember.CrewRole.CO_PILOT);
        return hasPilot && hasCoPilot;
    }
}
