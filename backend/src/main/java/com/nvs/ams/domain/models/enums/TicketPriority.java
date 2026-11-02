package com.nvs.ams.domain.models.enums;

import java.time.Duration;

public enum TicketPriority {
    P1(Duration.ofMinutes(15), Duration.ofHours(2), true),
    P2(Duration.ofMinutes(30), Duration.ofHours(6), false),
    P3(Duration.ofHours(2), Duration.ofHours(24), false),
    P4(Duration.ofHours(4), Duration.ofHours(72), false);

    private final Duration firstResponseTarget;
    private final Duration resolutionTarget;
    private final boolean continuousCoverage;

    TicketPriority(Duration firstResponseTarget, Duration resolutionTarget,
                   boolean continuousCoverage) {
        this.firstResponseTarget = firstResponseTarget;
        this.resolutionTarget = resolutionTarget;
        this.continuousCoverage = continuousCoverage;
    }

    public Duration getFirstResponseTarget() {
        return firstResponseTarget;
    }

    public Duration getResolutionTarget() {
        return resolutionTarget;
    }

    public boolean hasContinuousCoverage() {
        return continuousCoverage;
    }
}
