package com.airline.controller;

import com.airline.dto.ApiResponse;
import com.airline.model.SystemRule;
import com.airline.service.SystemRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SystemRuleController {

    private final SystemRuleService systemRuleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SystemRule>>> getAllRules() {
        return ResponseEntity.ok(ApiResponse.success(systemRuleService.getAllRules()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SystemRule>> getRuleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(systemRuleService.getRuleById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SystemRule>> createRule(@RequestBody SystemRule rule) {
        return ResponseEntity.ok(ApiResponse.success("Rule created", systemRuleService.createRule(rule)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SystemRule>> updateRule(@PathVariable Long id, @RequestBody SystemRule rule) {
        return ResponseEntity.ok(ApiResponse.success("Rule updated", systemRuleService.updateRule(id, rule)));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleRule(@PathVariable Long id) {
        systemRuleService.toggleRule(id);
        return ResponseEntity.ok(ApiResponse.success("Rule toggled", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable Long id) {
        systemRuleService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success("Rule deleted", null));
    }
}
