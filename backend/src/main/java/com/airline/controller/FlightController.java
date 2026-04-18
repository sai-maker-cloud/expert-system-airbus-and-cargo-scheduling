package com.airline.controller;

import com.airline.dto.ApiResponse;
import com.airline.dto.FlightDto;
import com.airline.model.Flight;
import com.airline.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FlightController {

    private final FlightService flightService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FlightDto.Response>>> getAllFlights() {
        return ResponseEntity.ok(ApiResponse.success(flightService.getAllFlights()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlightDto.Response>> getFlightById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(flightService.getFlightById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FlightDto.Response>> createFlight(@RequestBody FlightDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Flight created successfully", flightService.createFlight(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FlightDto.Response>> updateFlight(@PathVariable Long id, @RequestBody FlightDto.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Flight updated", flightService.updateFlight(id, request)));
    }

    @PostMapping("/{flightId}/assign-aircraft/{aircraftId}")
    public ResponseEntity<ApiResponse<FlightDto.Response>> assignAircraft(@PathVariable Long flightId, @PathVariable Long aircraftId) {
        return ResponseEntity.ok(ApiResponse.success("Aircraft assigned to flight", flightService.assignAircraft(flightId, aircraftId)));
    }

    @PostMapping("/{flightId}/assign-crew/{crewId}")
    public ResponseEntity<ApiResponse<FlightDto.Response>> assignCrew(@PathVariable Long flightId, @PathVariable Long crewId) {
        return ResponseEntity.ok(ApiResponse.success("Crew member assigned to flight", flightService.assignCrew(flightId, crewId)));
    }

    @DeleteMapping("/{flightId}/remove-crew/{crewId}")
    public ResponseEntity<ApiResponse<FlightDto.Response>> removeCrew(@PathVariable Long flightId, @PathVariable Long crewId) {
        return ResponseEntity.ok(ApiResponse.success("Crew member removed from flight", flightService.removeCrewFromFlight(flightId, crewId)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<FlightDto.Response>> updateStatus(@PathVariable Long id, @RequestParam Flight.FlightStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Flight status updated", flightService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFlight(@PathVariable Long id) {
        flightService.deleteFlight(id);
        return ResponseEntity.ok(ApiResponse.success("Flight deleted", null));
    }
}
