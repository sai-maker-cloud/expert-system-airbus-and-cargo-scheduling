package com.airline.controller;

import com.airline.dto.ApiResponse;
import com.airline.dto.CrewDto;
import com.airline.model.CrewMember;
import com.airline.service.CrewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/crew")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CrewController {

    private final CrewService crewService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CrewDto.Response>>> getAllCrew() {
        return ResponseEntity.ok(ApiResponse.success(crewService.getAllCrew()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CrewDto.Response>> getCrewById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(crewService.getCrewById(id)));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<CrewDto.Response>>> getAvailableCrew() {
        return ResponseEntity.ok(ApiResponse.success(crewService.getAvailableCrew()));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<CrewDto.Response>>> getCrewByRole(@PathVariable CrewMember.CrewRole role) {
        return ResponseEntity.ok(ApiResponse.success(crewService.getCrewByRole(role)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CrewDto.Response>> createCrew(@RequestBody CrewDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Crew member created successfully", crewService.createCrew(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CrewDto.Response>> updateCrew(@PathVariable Long id, @RequestBody CrewDto.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Crew member updated", crewService.updateCrew(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CrewDto.Response>> updateStatus(@PathVariable Long id, @RequestParam CrewMember.CrewStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", crewService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCrew(@PathVariable Long id) {
        crewService.deleteCrew(id);
        return ResponseEntity.ok(ApiResponse.success("Crew member deleted", null));
    }
}
