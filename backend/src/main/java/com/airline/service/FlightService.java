package com.airline.service;

import com.airline.dto.AircraftDto;
import com.airline.dto.CrewDto;
import com.airline.dto.FlightDto;
import com.airline.exception.BusinessRuleException;
import com.airline.exception.ResourceNotFoundException;
import com.airline.model.*;
import com.airline.repository.*;
import com.airline.rules.RuleEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FlightService {

    private final FlightRepository flightRepository;
    private final AircraftRepository aircraftRepository;
    private final CrewMemberRepository crewMemberRepository;
    private final AircraftService aircraftService;
    private final CrewService crewService;
    private final RuleEngine ruleEngine;

    public List<FlightDto.Response> getAllFlights() {
        return flightRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public FlightDto.Response getFlightById(Long id) {
        return toResponse(findById(id));
    }

    public FlightDto.Response createFlight(FlightDto.Request request) {
        if (flightRepository.findByFlightNumber(request.getFlightNumber()).isPresent()) {
            throw new BusinessRuleException("Flight with number " + request.getFlightNumber() + " already exists");
        }
        if (request.getDepartureTime().isAfter(request.getArrivalTime())) {
            throw new BusinessRuleException("Departure time must be before arrival time");
        }

        Flight flight = new Flight();
        flight.setFlightNumber(request.getFlightNumber());
        flight.setOrigin(request.getOrigin());
        flight.setDestination(request.getDestination());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());
        flight.setDistanceKm(request.getDistanceKm());

        if (request.getAircraftId() != null) {
            Aircraft aircraft = aircraftRepository.findById(request.getAircraftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Aircraft", request.getAircraftId()));
            List<String> violations = ruleEngine.validateAircraftAssignment(aircraft, flight);
            if (!violations.isEmpty()) {
                throw new BusinessRuleException(String.join("; ", violations));
            }
            flight.setAircraft(aircraft);
            aircraft.setStatus(Aircraft.AircraftStatus.IN_FLIGHT);
            aircraftRepository.save(aircraft);
        }

        return toResponse(flightRepository.save(flight));
    }

    public FlightDto.Response updateFlight(Long id, FlightDto.Request request) {
        Flight flight = findById(id);
        flight.setFlightNumber(request.getFlightNumber());
        flight.setOrigin(request.getOrigin());
        flight.setDestination(request.getDestination());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());
        flight.setDistanceKm(request.getDistanceKm());
        return toResponse(flightRepository.save(flight));
    }

    public FlightDto.Response assignAircraft(Long flightId, Long aircraftId) {
        Flight flight = findById(flightId);
        Aircraft aircraft = aircraftRepository.findById(aircraftId)
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft", aircraftId));

        List<String> violations = ruleEngine.validateAircraftAssignment(aircraft, flight);
        if (!violations.isEmpty()) {
            throw new BusinessRuleException(String.join("; ", violations));
        }

        if (flight.getAircraft() != null) {
            Aircraft old = flight.getAircraft();
            old.setStatus(Aircraft.AircraftStatus.AVAILABLE);
            aircraftRepository.save(old);
        }

        flight.setAircraft(aircraft);
        aircraft.setStatus(Aircraft.AircraftStatus.IN_FLIGHT);
        aircraftRepository.save(aircraft);
        return toResponse(flightRepository.save(flight));
    }

    public FlightDto.Response assignCrew(Long flightId, Long crewId) {
        Flight flight = findById(flightId);
        CrewMember crew = crewMemberRepository.findById(crewId)
                .orElseThrow(() -> new ResourceNotFoundException("Crew member", crewId));

        List<String> violations = ruleEngine.validateCrewAssignment(crew, flight);
        if (!violations.isEmpty()) {
            throw new BusinessRuleException(String.join("; ", violations));
        }

        flight.getCrewMembers().add(crew);
        crew.setStatus(CrewMember.CrewStatus.ON_DUTY);
        crew.setHoursFlownToday(crew.getHoursFlownToday() + flight.getDurationHours());
        crew.setTotalHoursFlown(crew.getTotalHoursFlown() + flight.getDurationHours());
        crewMemberRepository.save(crew);
        return toResponse(flightRepository.save(flight));
    }

    public FlightDto.Response removeCrewFromFlight(Long flightId, Long crewId) {
        Flight flight = findById(flightId);
        CrewMember crew = crewMemberRepository.findById(crewId)
                .orElseThrow(() -> new ResourceNotFoundException("Crew member", crewId));

        flight.getCrewMembers().removeIf(c -> c.getId().equals(crewId));
        crew.setStatus(CrewMember.CrewStatus.AVAILABLE);
        crewMemberRepository.save(crew);
        return toResponse(flightRepository.save(flight));
    }

    public FlightDto.Response updateStatus(Long id, Flight.FlightStatus status) {
        Flight flight = findById(id);
        flight.setStatus(status);
        if (status == Flight.FlightStatus.LANDED || status == Flight.FlightStatus.CANCELLED) {
            if (flight.getAircraft() != null) {
                flight.getAircraft().setStatus(Aircraft.AircraftStatus.AVAILABLE);
                aircraftRepository.save(flight.getAircraft());
            }
            flight.getCrewMembers().forEach(c -> {
                c.setStatus(CrewMember.CrewStatus.AVAILABLE);
                crewMemberRepository.save(c);
            });
        }
        return toResponse(flightRepository.save(flight));
    }

    public void deleteFlight(Long id) {
        Flight flight = findById(id);
        if (flight.getStatus() == Flight.FlightStatus.IN_FLIGHT || flight.getStatus() == Flight.FlightStatus.BOARDING) {
            throw new BusinessRuleException("Cannot delete an active flight");
        }
        flightRepository.delete(flight);
    }

    private Flight findById(Long id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", id));
    }

    public FlightDto.Response toResponse(Flight flight) {
        double assignedWeight = flight.getCargoList().stream().mapToDouble(Cargo::getWeight).sum();
        double available = flight.getAircraft() != null
                ? flight.getAircraft().getMaxCargoWeight() - assignedWeight
                : 0;

        return FlightDto.Response.builder()
                .id(flight.getId())
                .flightNumber(flight.getFlightNumber())
                .origin(flight.getOrigin())
                .destination(flight.getDestination())
                .departureTime(flight.getDepartureTime())
                .arrivalTime(flight.getArrivalTime())
                .distanceKm(flight.getDistanceKm())
                .status(flight.getStatus())
                .aircraft(aircraftService.toSummary(flight.getAircraft()))
                .crewMembers(flight.getCrewMembers().stream().map(crewService::toSummary).collect(Collectors.toList()))
                .crewCount(flight.getCrewMembers().size())
                .totalCargoWeight(assignedWeight)
                .availableCargoCapacity(available)
                .delayMinutes(flight.getDelayMinutes())
                .createdAt(flight.getCreatedAt())
                .build();
    }
}
