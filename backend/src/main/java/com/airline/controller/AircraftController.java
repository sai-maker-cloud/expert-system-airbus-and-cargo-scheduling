package com.airline.controller;

import com.airline.dto.AircraftDto;
import com.airline.dto.ApiResponse;
import com.airline.model.Aircraft;
import com.airline.service.AircraftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/aircraft")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AircraftController {

    private final AircraftService aircraftService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AircraftDto.Response>>> getAllAircraft() {
        return ResponseEntity.ok(ApiResponse.success(aircraftService.getAllAircraft()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AircraftDto.Response>> getAircraftById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(aircraftService.getAircraftById(id)));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<AircraftDto.Response>>> getAvailableAircraft() {
        return ResponseEntity.ok(ApiResponse.success(aircraftService.getAvailableAircraft()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AircraftDto.Response>> createAircraft(@RequestBody AircraftDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Aircraft created successfully", aircraftService.createAircraft(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AircraftDto.Response>> updateAircraft(@PathVariable Long id, @RequestBody AircraftDto.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Aircraft updated successfully", aircraftService.updateAircraft(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AircraftDto.Response>> updateStatus(@PathVariable Long id, @RequestParam Aircraft.AircraftStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", aircraftService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAircraft(@PathVariable Long id) {
        aircraftService.deleteAircraft(id);
        return ResponseEntity.ok(ApiResponse.success("Aircraft deleted successfully", null));
    }
}
