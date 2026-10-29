package com.nvs.ams.presentation.dto.response;

import java.time.LocalDate;
import java.util.List;

public record SlaReportResponse(
        LocalDate from,
        LocalDate to,
        List<DimensionMetrics> byPriority,
        List<DimensionMetrics> byTeam
) {
    public record DimensionMetrics(
            String dimension,
            String value,
            long ticketCount,
            long tmrMeasuredCount,
            long tmrCompliantCount,
            long tmrViolationCount,
            double tmrCompliancePercent,
            long tmsMeasuredCount,
            long tmsCompliantCount,
            long tmsViolationCount,
            double tmsCompliancePercent
    ) {
    }
}
