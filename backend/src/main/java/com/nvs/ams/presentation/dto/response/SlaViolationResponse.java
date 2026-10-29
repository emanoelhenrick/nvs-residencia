package com.nvs.ams.presentation.dto.response;

import com.nvs.ams.domain.models.SlaViolation;

import java.time.Instant;

public record SlaViolationResponse(
        Long ticketId,
        String protocol,
        String metric,
        Instant deadlineAt,
        Instant detectedAt
) {
    public static SlaViolationResponse from(SlaViolation violation) {
        return new SlaViolationResponse(
                violation.getTicket().getId(),
                violation.getTicket().getProtocol(),
                violation.getMetric().name(),
                violation.getDeadlineAt(),
                violation.getDetectedAt());
    }
}
