package com.airline.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;
import java.util.Map;

public class AgentDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Suggestion {
        private String suggestion;
        private String reason;
        private Double confidenceScore;
        private String category;
        private Map<String, Object> metadata;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConflictReport {
        private String conflictType;
        private String severity;
        private String description;
        private String affectedEntity;
        private Long entityId;
        private String proposedFix;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OptimizationResult {
        private Integer totalCargoProcessed;
        private Integer successfulAssignments;
        private Integer splitOccurred;
        private Integer unassigned;
        private List<String> actions;
        private String summary;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DelayPrediction {
        private Long flightId;
        private String flightNumber;
        private Boolean delayLikely;
        private Integer estimatedDelayMinutes;
        private List<String> reasons;
        private String riskLevel;
    }
}
