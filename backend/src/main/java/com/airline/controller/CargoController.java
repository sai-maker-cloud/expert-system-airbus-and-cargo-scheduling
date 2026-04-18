package com.airline.controller;

import com.airline.dto.ApiResponse;
import com.airline.dto.CargoDto;
import com.airline.service.CargoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cargo")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CargoController {

    private final CargoService cargoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CargoDto.Response>>> getAllCargo() {
        return ResponseEntity.ok(ApiResponse.success(cargoService.getAllCargo()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CargoDto.Response>> getCargoById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(cargoService.getCargoById(id)));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<CargoDto.Response>>> getPendingCargo() {
        return ResponseEntity.ok(ApiResponse.success(cargoService.getPendingCargo()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CargoDto.Response>> createCargo(@RequestBody CargoDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Cargo created successfully", cargoService.createCargo(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CargoDto.Response>> updateCargo(@PathVariable Long id, @RequestBody CargoDto.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Cargo updated", cargoService.updateCargo(id, request)));
    }

    @PostMapping("/{cargoId}/assign/{flightId}")
    public ResponseEntity<ApiResponse<CargoDto.Response>> assignToFlight(@PathVariable Long cargoId, @PathVariable Long flightId) {
        return ResponseEntity.ok(ApiResponse.success("Cargo assigned to flight", cargoService.assignToFlight(cargoId, flightId)));
    }

    @DeleteMapping("/{cargoId}/unassign")
    public ResponseEntity<ApiResponse<CargoDto.Response>> unassignFromFlight(@PathVariable Long cargoId) {
        return ResponseEntity.ok(ApiResponse.success("Cargo unassigned from flight", cargoService.unassignFromFlight(cargoId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCargo(@PathVariable Long id) {
        cargoService.deleteCargo(id);
        return ResponseEntity.ok(ApiResponse.success("Cargo deleted", null));
    }
}
