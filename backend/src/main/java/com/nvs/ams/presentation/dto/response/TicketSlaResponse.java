package com.nvs.ams.presentation.dto.response;

import java.time.Instant;

import com.nvs.ams.services.SlaService.SlaMetrics;

public record TicketSlaResponse(
        String priority,
        long tmrTargetMinutes,
        long tmsTargetMinutes,
        Instant tmrDeadlineAt,
        Instant tmsDeadlineAt,
        long tmrConsumedMinutes,
        long tmsConsumedMinutes,
        boolean tmrBreached,
        boolean tmsBreached,
        boolean tmrWarningDue,
        boolean tmsWarningDue
) {
    public static TicketSlaResponse from(SlaMetrics metrics) {
        if (metrics == null) {
            return null;
        }
        return new TicketSlaResponse(
                metrics.priority().name(),
                metrics.tmrTargetMinutes(),
                metrics.tmsTargetMinutes(),
                metrics.tmrDeadlineAt(),
                metrics.tmsDeadlineAt(),
                metrics.tmrConsumedMinutes(),
                metrics.tmsConsumedMinutes(),
                metrics.tmrBreached(),
                metrics.tmsBreached(),
                metrics.tmrWarningDue(),
                metrics.tmsWarningDue());
    }
}
