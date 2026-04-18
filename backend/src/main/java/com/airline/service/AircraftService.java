package com.airline.service;

import com.airline.dto.AircraftDto;
import com.airline.exception.BusinessRuleException;
import com.airline.exception.ResourceNotFoundException;
import com.airline.model.Aircraft;
import com.airline.repository.AircraftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AircraftService {

    private final AircraftRepository aircraftRepository;

    public List<AircraftDto.Response> getAllAircraft() {
        return aircraftRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AircraftDto.Response getAircraftById(Long id) {
        return toResponse(findById(id));
    }

    public AircraftDto.Response createAircraft(AircraftDto.Request request) {
        if (aircraftRepository.findByRegistrationNumber(request.getRegistrationNumber()).isPresent()) {
            throw new BusinessRuleException("Aircraft with registration number " + request.getRegistrationNumber() + " already exists");
        }
        Aircraft aircraft = new Aircraft();
        mapRequestToEntity(request, aircraft);
        return toResponse(aircraftRepository.save(aircraft));
    }

    public AircraftDto.Response updateAircraft(Long id, AircraftDto.Request request) {
        Aircraft aircraft = findById(id);
        mapRequestToEntity(request, aircraft);
        return toResponse(aircraftRepository.save(aircraft));
    }

    public AircraftDto.Response updateStatus(Long id, Aircraft.AircraftStatus status) {
        Aircraft aircraft = findById(id);
        aircraft.setStatus(status);
        return toResponse(aircraftRepository.save(aircraft));
    }

    public void deleteAircraft(Long id) {
        Aircraft aircraft = findById(id);
        if (aircraft.getStatus() == Aircraft.AircraftStatus.IN_FLIGHT) {
            throw new BusinessRuleException("Cannot delete an aircraft that is currently in flight");
        }
        aircraftRepository.delete(aircraft);
    }

    public List<AircraftDto.Response> getAvailableAircraft() {
        return aircraftRepository.findByStatus(Aircraft.AircraftStatus.AVAILABLE).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private Aircraft findById(Long id) {
        return aircraftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft", id));
    }

    private void mapRequestToEntity(AircraftDto.Request request, Aircraft aircraft) {
        aircraft.setRegistrationNumber(request.getRegistrationNumber());
        aircraft.setModel(request.getModel());
        aircraft.setMaxCargoWeight(request.getMaxCargoWeight());
        aircraft.setMaxCargoVolume(request.getMaxCargoVolume());
        aircraft.setPassengerCapacity(request.getPassengerCapacity());
        aircraft.setFuelEfficiency(request.getFuelEfficiency());
        aircraft.setLastMaintenanceDate(request.getLastMaintenanceDate());
        aircraft.setNextMaintenanceDate(request.getNextMaintenanceDate());
    }

    public AircraftDto.Response toResponse(Aircraft aircraft) {
        return AircraftDto.Response.builder()
                .id(aircraft.getId())
                .registrationNumber(aircraft.getRegistrationNumber())
                .model(aircraft.getModel())
                .maxCargoWeight(aircraft.getMaxCargoWeight())
                .maxCargoVolume(aircraft.getMaxCargoVolume())
                .passengerCapacity(aircraft.getPassengerCapacity())
                .fuelEfficiency(aircraft.getFuelEfficiency())
                .status(aircraft.getStatus())
                .lastMaintenanceDate(aircraft.getLastMaintenanceDate())
                .nextMaintenanceDate(aircraft.getNextMaintenanceDate())
                .createdAt(aircraft.getCreatedAt())
                .build();
    }

    public AircraftDto.Summary toSummary(Aircraft aircraft) {
        if (aircraft == null) return null;
        return AircraftDto.Summary.builder()
                .id(aircraft.getId())
                .registrationNumber(aircraft.getRegistrationNumber())
                .model(aircraft.getModel())
                .status(aircraft.getStatus())
                .maxCargoWeight(aircraft.getMaxCargoWeight())
                .build();
    }
}
