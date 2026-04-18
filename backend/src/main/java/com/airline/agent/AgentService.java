package com.airline.agent;

import com.airline.dto.AgentDto;
import com.airline.exception.ResourceNotFoundException;
import com.airline.model.*;
import com.airline.repository.*;
import com.airline.rules.RuleEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgentService {

    private final FlightRepository flightRepository;
    private final AircraftRepository aircraftRepository;
    private final CrewMemberRepository crewMemberRepository;
    private final CargoRepository cargoRepository;
    private final RuleEngine ruleEngine;

    public AgentDto.Suggestion suggestAircraftForFlight(Long flightId) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", flightId));

        List<Aircraft> available = aircraftRepository.findByStatus(Aircraft.AircraftStatus.AVAILABLE);

        if (available.isEmpty()) {
            return AgentDto.Suggestion.builder()
                    .suggestion("No aircraft available")
                    .reason("All aircraft are either in-flight, under maintenance, or retired")
                    .confidenceScore(0.0)
                    .category("AIRCRAFT")
                    .build();
        }

        Aircraft best = available.stream()
                .max(Comparator.comparingDouble(a -> scoreAircraft(a, flight)))
                .orElseThrow();

        double score = scoreAircraft(best, flight);
        List<String> reasons = buildAircraftReasons(best, flight);
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("aircraftId", best.getId());
        metadata.put("registrationNumber", best.getRegistrationNumber());
        metadata.put("model", best.getModel());
        metadata.put("score", Math.round(score * 10.0) / 10.0);
        metadata.put("fuelEfficiency", best.getFuelEfficiency());
        metadata.put("maxCargoWeight", best.getMaxCargoWeight());

        return AgentDto.Suggestion.builder()
                .suggestion("Assign Aircraft " + best.getModel() + " (" + best.getRegistrationNumber() + ")")
                .reason(String.join("; ", reasons))
                .confidenceScore(Math.min(score / 100.0, 1.0))
                .category("AIRCRAFT")
                .metadata(metadata)
                .build();
    }

    private double scoreAircraft(Aircraft aircraft, Flight flight) {
        double score = 0;

        if (aircraft.getStatus() == Aircraft.AircraftStatus.AVAILABLE) score += 40;
        if (aircraft.getStatus() == Aircraft.AircraftStatus.MAINTENANCE) return -100;

        score += aircraft.getFuelEfficiency() * 3;

        if (aircraft.getNextMaintenanceDate() != null) {
            long daysToMaintenance = LocalDate.now().until(aircraft.getNextMaintenanceDate()).getDays();
            if (daysToMaintenance > 30) score += 20;
            else if (daysToMaintenance > 7) score += 10;
            else if (daysToMaintenance <= ruleEngine.getMaintenanceBufferDays()) score -= 30;
        } else {
            score += 15;
        }

        if (flight.getDistanceKm() > 2000 && aircraft.getMaxCargoWeight() > 50000) score += 15;
        else if (flight.getDistanceKm() < 1000 && aircraft.getMaxCargoWeight() < 25000) score += 15;
        else score += 5;

        return score;
    }

    private List<String> buildAircraftReasons(Aircraft aircraft, Flight flight) {
        List<String> reasons = new ArrayList<>();
        reasons.add("Status: " + aircraft.getStatus());
        reasons.add("Fuel efficiency: " + aircraft.getFuelEfficiency() + " km/L");
        if (aircraft.getNextMaintenanceDate() != null) {
            reasons.add("Next maintenance: " + aircraft.getNextMaintenanceDate());
        }
        reasons.add("Cargo capacity: " + aircraft.getMaxCargoWeight() + "kg / " + aircraft.getMaxCargoVolume() + "m³");
        return reasons;
    }

    public List<AgentDto.Suggestion> suggestCrewForFlight(Long flightId) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", flightId));

        double maxHours = ruleEngine.getMaxCrewDutyHours();
        double flightDuration = flight.getDurationHours();
        Set<Long> assignedIds = flight.getCrewMembers().stream()
                .map(CrewMember::getId).collect(Collectors.toSet());

        List<CrewMember> candidates = crewMemberRepository.findAvailableCrewUnderHourLimit(maxHours - flightDuration)
                .stream()
                .filter(c -> !assignedIds.contains(c.getId()))
                .collect(Collectors.toList());

        Map<CrewMember.CrewRole, List<CrewMember>> byRole = candidates.stream()
                .collect(Collectors.groupingBy(CrewMember::getRole));

        List<AgentDto.Suggestion> suggestions = new ArrayList<>();

        addRoleSuggestion(suggestions, byRole, CrewMember.CrewRole.PILOT, flight, "Captain required for command");
        addRoleSuggestion(suggestions, byRole, CrewMember.CrewRole.CO_PILOT, flight, "Co-pilot required for safety redundancy");
        addRoleSuggestion(suggestions, byRole, CrewMember.CrewRole.FLIGHT_ATTENDANT, flight, "Cabin crew for passenger service");
        addRoleSuggestion(suggestions, byRole, CrewMember.CrewRole.PURSER, flight, "Purser for cabin management");

        return suggestions;
    }

    private void addRoleSuggestion(List<AgentDto.Suggestion> suggestions,
                                    Map<CrewMember.CrewRole, List<CrewMember>> byRole,
                                    CrewMember.CrewRole role, Flight flight, String roleReason) {
        List<CrewMember> roleCandidates = byRole.getOrDefault(role, Collections.emptyList());
        if (roleCandidates.isEmpty()) {
            suggestions.add(AgentDto.Suggestion.builder()
                    .suggestion("No " + role.name().replace("_", " ") + " available")
                    .reason("All crew members of this role are unavailable or at max hours")
                    .confidenceScore(0.0)
                    .category("CREW_" + role.name())
                    .build());
            return;
        }

        CrewMember best = roleCandidates.stream()
                .max(Comparator.comparingDouble(c -> scoreCrewMember(c, flight)))
                .orElseThrow();

        double score = scoreCrewMember(best, flight);
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("crewId", best.getId());
        metadata.put("employeeId", best.getEmployeeId());
        metadata.put("hoursFlownToday", best.getHoursFlownToday());
        metadata.put("score", Math.round(score * 10.0) / 10.0);

        suggestions.add(AgentDto.Suggestion.builder()
                .suggestion("Assign " + role.name().replace("_", " ") + ": " + best.getFullName() + " (" + best.getEmployeeId() + ")")
                .reason(roleReason + ". Duty hours today: " + best.getHoursFlownToday() + "h. Base: " + best.getBaseStation())
                .confidenceScore(Math.min(score / 100.0, 1.0))
                .category("CREW_" + role.name())
                .metadata(metadata)
                .build());
    }

    private double scoreCrewMember(CrewMember crew, Flight flight) {
        double score = 50;
        score -= crew.getHoursFlownToday() * 5;

        if (crew.getBaseStation().equals(flight.getOrigin())) score += 20;

        if (crew.getLicenseExpiry() != null) {
            long daysToExpiry = LocalDate.now().until(crew.getLicenseExpiry()).getDays();
            if (daysToExpiry > 180) score += 15;
            else if (daysToExpiry > 30) score += 5;
            else score -= 20;
        }

        score += Math.min(crew.getTotalHoursFlown() / 1000.0, 10);
        return score;
    }

    public AgentDto.OptimizationResult optimizeCargo() {
        List<Cargo> pendingCargo = cargoRepository.findPendingCargoByPriority();
        List<Flight> availableFlights = flightRepository.findByStatus(Flight.FlightStatus.SCHEDULED);

        int assigned = 0, split = 0, unassigned = 0;
        List<String> actions = new ArrayList<>();
        double maxWeightPct = ruleEngine.getMaxCargoWeightPercent() / 100.0;

        List<Cargo> sortedCargo = pendingCargo.stream()
                .sorted(Comparator.comparingInt(Cargo::getPriorityScore).reversed()
                        .thenComparing(Cargo::getCreatedAt))
                .collect(Collectors.toList());

        for (Cargo cargo : sortedCargo) {
            boolean wasAssigned = false;
            List<Flight> matchingFlights = availableFlights.stream()
                    .filter(f -> f.getDestination().equals(cargo.getDestination()))
                    .filter(f -> f.getAircraft() != null)
                    .sorted(Comparator.comparing(Flight::getDepartureTime))
                    .collect(Collectors.toList());

            for (Flight flight : matchingFlights) {
                double maxWeight = flight.getAircraft().getMaxCargoWeight() * maxWeightPct;
                double usedWeight = flight.getAssignedCargoWeight();
                double remainingWeight = maxWeight - usedWeight;

                double maxVolume = flight.getAircraft().getMaxCargoVolume();
                double usedVolume = flight.getAssignedCargoVolume();
                double remainingVolume = maxVolume - usedVolume;

                if (remainingWeight >= cargo.getWeight() && remainingVolume >= cargo.getVolume()) {
                    cargo.setFlight(flight);
                    cargo.setStatus(Cargo.CargoStatus.ASSIGNED);
                    cargoRepository.save(cargo);
                    actions.add("Assigned cargo " + cargo.getTrackingNumber() + " [" + cargo.getPriority() + "] to flight " + flight.getFlightNumber());
                    assigned++;
                    wasAssigned = true;
                    break;
                } else if (remainingWeight > 0 && remainingVolume > 0 && cargo.getWeight() > remainingWeight) {
                    double splitWeight = remainingWeight;
                    double splitVolume = Math.min(cargo.getVolume() * (splitWeight / cargo.getWeight()), remainingVolume);

                    Cargo splitCargo = new Cargo();
                    splitCargo.setTrackingNumber(cargo.getTrackingNumber() + "-SPL1");
                    splitCargo.setDescription(cargo.getDescription() + " (Split Part 1)");
                    splitCargo.setWeight(splitWeight);
                    splitCargo.setVolume(splitVolume);
                    splitCargo.setOrigin(cargo.getOrigin());
                    splitCargo.setDestination(cargo.getDestination());
                    splitCargo.setPriority(cargo.getPriority());
                    splitCargo.setStatus(Cargo.CargoStatus.ASSIGNED);
                    splitCargo.setCustomerName(cargo.getCustomerName());
                    splitCargo.setCustomerContact(cargo.getCustomerContact());
                    splitCargo.setFlight(flight);
                    splitCargo.setParentCargo(cargo);
                    cargoRepository.save(splitCargo);

                    cargo.setWeight(cargo.getWeight() - splitWeight);
                    cargo.setVolume(cargo.getVolume() - splitVolume);
                    cargo.setStatus(Cargo.CargoStatus.SPLIT);
                    cargoRepository.save(cargo);

                    actions.add("Split cargo " + cargo.getTrackingNumber() + " — part assigned to flight " + flight.getFlightNumber() + " (" + Math.round(splitWeight) + "kg)");
                    split++;
                    break;
                }
            }

            if (!wasAssigned && cargo.getStatus() == Cargo.CargoStatus.PENDING) {
                actions.add("Could not assign cargo " + cargo.getTrackingNumber() + " [" + cargo.getPriority() + "] — no suitable flight found for " + cargo.getDestination());
                unassigned++;
            }
        }

        return AgentDto.OptimizationResult.builder()
                .totalCargoProcessed(sortedCargo.size())
                .successfulAssignments(assigned)
                .splitOccurred(split)
                .unassigned(unassigned)
                .actions(actions)
                .summary("Processed " + sortedCargo.size() + " cargo items. Assigned: " + assigned + ", Split: " + split + ", Unassigned: " + unassigned)
                .build();
    }

    public List<AgentDto.ConflictReport> detectConflicts() {
        List<AgentDto.ConflictReport> conflicts = new ArrayList<>();

        List<Flight> flights = flightRepository.findAll();
        for (Flight flight : flights) {
            if (flight.getStatus() == Flight.FlightStatus.CANCELLED || flight.getStatus() == Flight.FlightStatus.LANDED) continue;

            if (flight.getAircraft() == null) {
                conflicts.add(AgentDto.ConflictReport.builder()
                        .conflictType("UNASSIGNED_AIRCRAFT")
                        .severity("HIGH")
                        .description("Flight " + flight.getFlightNumber() + " has no aircraft assigned")
                        .affectedEntity("FLIGHT")
                        .entityId(flight.getId())
                        .proposedFix("Use AI Agent to suggest and assign an available aircraft")
                        .build());
            }

            if (flight.getCrewMembers().size() < ruleEngine.getMinCrewSize()) {
                conflicts.add(AgentDto.ConflictReport.builder()
                        .conflictType("INSUFFICIENT_CREW")
                        .severity("HIGH")
                        .description("Flight " + flight.getFlightNumber() + " has " + flight.getCrewMembers().size() + "/" + ruleEngine.getMinCrewSize() + " required crew")
                        .affectedEntity("FLIGHT")
                        .entityId(flight.getId())
                        .proposedFix("Use AI Agent to suggest crew assignments")
                        .build());
            }

            boolean hasPilot = flight.getCrewMembers().stream().anyMatch(c -> c.getRole() == CrewMember.CrewRole.PILOT);
            if (!hasPilot && !flight.getCrewMembers().isEmpty()) {
                conflicts.add(AgentDto.ConflictReport.builder()
                        .conflictType("MISSING_PILOT")
                        .severity("CRITICAL")
                        .description("Flight " + flight.getFlightNumber() + " has no captain assigned")
                        .affectedEntity("FLIGHT")
                        .entityId(flight.getId())
                        .proposedFix("Assign a pilot immediately — flight cannot depart without a captain")
                        .build());
            }
        }

        List<Aircraft> aircraft = aircraftRepository.findAll();
        for (Aircraft a : aircraft) {
            if (a.getNextMaintenanceDate() != null) {
                long daysUntil = LocalDate.now().until(a.getNextMaintenanceDate()).getDays();
                if (daysUntil <= ruleEngine.getMaintenanceBufferDays() && a.getStatus() == Aircraft.AircraftStatus.AVAILABLE) {
                    conflicts.add(AgentDto.ConflictReport.builder()
                            .conflictType("MAINTENANCE_DUE")
                            .severity(daysUntil <= 1 ? "CRITICAL" : "MEDIUM")
                            .description("Aircraft " + a.getRegistrationNumber() + " (" + a.getModel() + ") requires maintenance in " + daysUntil + " day(s)")
                            .affectedEntity("AIRCRAFT")
                            .entityId(a.getId())
                            .proposedFix("Schedule maintenance and update aircraft status to MAINTENANCE")
                            .build());
                }
            }
        }

        List<CrewMember> crew = crewMemberRepository.findAll();
        for (CrewMember c : crew) {
            if (c.getLicenseExpiry() != null && c.getLicenseExpiry().isBefore(LocalDate.now().plusDays(30))) {
                conflicts.add(AgentDto.ConflictReport.builder()
                        .conflictType("LICENSE_EXPIRING")
                        .severity(c.getLicenseExpiry().isBefore(LocalDate.now()) ? "CRITICAL" : "MEDIUM")
                        .description("Crew member " + c.getFullName() + " license " + (c.getLicenseExpiry().isBefore(LocalDate.now()) ? "EXPIRED" : "expiring on " + c.getLicenseExpiry()))
                        .affectedEntity("CREW")
                        .entityId(c.getId())
                        .proposedFix("Initiate license renewal and restrict from pilot duties until renewed")
                        .build());
            }
        }

        List<Cargo> highPriorityCargo = cargoRepository.findPendingCargoByPriority().stream()
                .filter(c -> c.getPriority() == Cargo.CargoPriority.HIGH || c.getPriority() == Cargo.CargoPriority.CRITICAL)
                .collect(Collectors.toList());

        for (Cargo cargo : highPriorityCargo) {
            long hoursOld = java.time.Duration.between(cargo.getCreatedAt(), LocalDateTime.now()).toHours();
            if (hoursOld >= ruleEngine.getHighPriorityWindowHours()) {
                conflicts.add(AgentDto.ConflictReport.builder()
                        .conflictType("UNASSIGNED_PRIORITY_CARGO")
                        .severity("HIGH")
                        .description("Cargo " + cargo.getTrackingNumber() + " [" + cargo.getPriority() + "] has been unassigned for " + hoursOld + " hours")
                        .affectedEntity("CARGO")
                        .entityId(cargo.getId())
                        .proposedFix("Run cargo optimization to assign this cargo to the next available flight to " + cargo.getDestination())
                        .build());
            }
        }

        return conflicts;
    }

    public List<AgentDto.DelayPrediction> predictDelays() {
        List<Flight> scheduledFlights = flightRepository.findByStatus(Flight.FlightStatus.SCHEDULED);
        List<AgentDto.DelayPrediction> predictions = new ArrayList<>();

        for (Flight flight : scheduledFlights) {
            List<String> reasons = new ArrayList<>();
            int estimatedDelay = 0;

            if (flight.getAircraft() == null) {
                reasons.add("No aircraft assigned");
                estimatedDelay += 60;
            }

            if (flight.getCrewMembers().size() < ruleEngine.getMinCrewSize()) {
                reasons.add("Insufficient crew (" + flight.getCrewMembers().size() + "/" + ruleEngine.getMinCrewSize() + ")");
                estimatedDelay += 30;
            }

            if (flight.getAircraft() != null && flight.getAircraft().getNextMaintenanceDate() != null) {
                long days = LocalDate.now().until(flight.getAircraft().getNextMaintenanceDate()).getDays();
                if (days <= 1) {
                    reasons.add("Aircraft maintenance overdue");
                    estimatedDelay += 120;
                }
            }

            if (flight.getCargoList().size() > 50) {
                reasons.add("High cargo volume may delay loading");
                estimatedDelay += 15;
            }

            if (flight.getDepartureTime().isBefore(LocalDateTime.now().plusHours(2)) && flight.getAircraft() == null) {
                reasons.add("Imminent departure with unresolved assignments");
                estimatedDelay += 45;
            }

            String riskLevel;
            if (estimatedDelay >= 90) riskLevel = "HIGH";
            else if (estimatedDelay >= 30) riskLevel = "MEDIUM";
            else riskLevel = "LOW";

            predictions.add(AgentDto.DelayPrediction.builder()
                    .flightId(flight.getId())
                    .flightNumber(flight.getFlightNumber())
                    .delayLikely(!reasons.isEmpty())
                    .estimatedDelayMinutes(estimatedDelay)
                    .reasons(reasons)
                    .riskLevel(riskLevel)
                    .build());
        }

        return predictions;
    }
}
