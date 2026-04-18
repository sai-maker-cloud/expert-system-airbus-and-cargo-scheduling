package com.airline.service;

import com.airline.dto.CargoDto;
import com.airline.exception.BusinessRuleException;
import com.airline.exception.ResourceNotFoundException;
import com.airline.model.Cargo;
import com.airline.model.Flight;
import com.airline.repository.CargoRepository;
import com.airline.repository.FlightRepository;
import com.airline.rules.RuleEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CargoService {

    private final CargoRepository cargoRepository;
    private final FlightRepository flightRepository;
    private final RuleEngine ruleEngine;

    public List<CargoDto.Response> getAllCargo() {
        return cargoRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CargoDto.Response getCargoById(Long id) {
        return toResponse(findById(id));
    }

    public CargoDto.Response createCargo(CargoDto.Request request) {
        Cargo cargo = new Cargo();
        cargo.setTrackingNumber("TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        cargo.setDescription(request.getDescription());
        cargo.setWeight(request.getWeight());
        cargo.setVolume(request.getVolume());
        cargo.setOrigin(request.getOrigin());
        cargo.setDestination(request.getDestination());
        cargo.setPriority(request.getPriority());
        cargo.setCustomerName(request.getCustomerName());
        cargo.setCustomerContact(request.getCustomerContact());
        return toResponse(cargoRepository.save(cargo));
    }

    public CargoDto.Response updateCargo(Long id, CargoDto.Request request) {
        Cargo cargo = findById(id);
        if (cargo.getStatus() != Cargo.CargoStatus.PENDING) {
            throw new BusinessRuleException("Only PENDING cargo can be updated");
        }
        cargo.setDescription(request.getDescription());
        cargo.setWeight(request.getWeight());
        cargo.setVolume(request.getVolume());
        cargo.setPriority(request.getPriority());
        cargo.setCustomerName(request.getCustomerName());
        cargo.setCustomerContact(request.getCustomerContact());
        return toResponse(cargoRepository.save(cargo));
    }

    public CargoDto.Response assignToFlight(Long cargoId, Long flightId) {
        Cargo cargo = findById(cargoId);
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", flightId));

        List<String> violations = ruleEngine.validateCargoAssignment(cargo, flight);
        if (!violations.isEmpty()) {
            throw new BusinessRuleException(String.join("; ", violations));
        }

        cargo.setFlight(flight);
        cargo.setStatus(Cargo.CargoStatus.ASSIGNED);
        return toResponse(cargoRepository.save(cargo));
    }

    public CargoDto.Response unassignFromFlight(Long cargoId) {
        Cargo cargo = findById(cargoId);
        if (cargo.getStatus() == Cargo.CargoStatus.IN_TRANSIT || cargo.getStatus() == Cargo.CargoStatus.DELIVERED) {
            throw new BusinessRuleException("Cannot unassign cargo that is in transit or delivered");
        }
        cargo.setFlight(null);
        cargo.setStatus(Cargo.CargoStatus.PENDING);
        return toResponse(cargoRepository.save(cargo));
    }

    public void deleteCargo(Long id) {
        Cargo cargo = findById(id);
        if (cargo.getStatus() == Cargo.CargoStatus.IN_TRANSIT) {
            throw new BusinessRuleException("Cannot delete cargo that is in transit");
        }
        cargoRepository.delete(cargo);
    }

    public List<CargoDto.Response> getPendingCargo() {
        return cargoRepository.findPendingCargoByPriority().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private Cargo findById(Long id) {
        return cargoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo", id));
    }

    public CargoDto.Response toResponse(Cargo cargo) {
        return CargoDto.Response.builder()
                .id(cargo.getId())
                .trackingNumber(cargo.getTrackingNumber())
                .description(cargo.getDescription())
                .weight(cargo.getWeight())
                .volume(cargo.getVolume())
                .origin(cargo.getOrigin())
                .destination(cargo.getDestination())
                .priority(cargo.getPriority())
                .status(cargo.getStatus())
                .customerName(cargo.getCustomerName())
                .customerContact(cargo.getCustomerContact())
                .flightId(cargo.getFlight() != null ? cargo.getFlight().getId() : null)
                .flightNumber(cargo.getFlight() != null ? cargo.getFlight().getFlightNumber() : null)
                .createdAt(cargo.getCreatedAt())
                .build();
    }
}
