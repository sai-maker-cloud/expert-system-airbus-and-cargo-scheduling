package com.airline.controller;

import com.airline.agent.AgentService;
import com.airline.dto.AgentDto;
import com.airline.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AgentController {

    private final AgentService agentService;

    @GetMapping("/suggest-aircraft/{flightId}")
    public ResponseEntity<ApiResponse<AgentDto.Suggestion>> suggestAircraft(@PathVariable Long flightId) {
        AgentDto.Suggestion suggestion = agentService.suggestAircraftForFlight(flightId);
        return ResponseEntity.ok(ApiResponse.success("Aircraft suggestion generated", suggestion));
    }

    @GetMapping("/suggest-crew/{flightId}")
    public ResponseEntity<ApiResponse<List<AgentDto.Suggestion>>> suggestCrew(@PathVariable Long flightId) {
        List<AgentDto.Suggestion> suggestions = agentService.suggestCrewForFlight(flightId);
        return ResponseEntity.ok(ApiResponse.success("Crew suggestions generated", suggestions));
    }

    @PostMapping("/optimize-cargo")
    public ResponseEntity<ApiResponse<AgentDto.OptimizationResult>> optimizeCargo() {
        AgentDto.OptimizationResult result = agentService.optimizeCargo();
        return ResponseEntity.ok(ApiResponse.success("Cargo optimization complete", result));
    }

    @GetMapping("/detect-conflicts")
    public ResponseEntity<ApiResponse<List<AgentDto.ConflictReport>>> detectConflicts() {
        List<AgentDto.ConflictReport> conflicts = agentService.detectConflicts();
        return ResponseEntity.ok(ApiResponse.success(conflicts.isEmpty() ? "No conflicts detected" : conflicts.size() + " conflict(s) detected", conflicts));
    }

    @GetMapping("/predict-delays")
    public ResponseEntity<ApiResponse<List<AgentDto.DelayPrediction>>> predictDelays() {
        List<AgentDto.DelayPrediction> predictions = agentService.predictDelays();
        return ResponseEntity.ok(ApiResponse.success("Delay predictions generated", predictions));
    }
}
