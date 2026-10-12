package com.nvs.ams.services;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.enums.TicketPriority;

@Service
public class SlaService {

    private static final LocalTime COVERAGE_START = LocalTime.of(8, 0);
    private static final LocalTime COVERAGE_END = LocalTime.of(18, 0);

    private final Clock clock;
    private final ZoneId zone;
    private final Set<LocalDate> holidays;

    public SlaService(Clock clock,
                      @Value("${nvs.sla.time-zone:America/Recife}") String timeZone,
                      @Value("${nvs.sla.holidays:}") String holidayDates) {
        this.clock = clock;
        this.zone = ZoneId.of(timeZone);
        this.holidays = Arrays.stream(holidayDates.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(LocalDate::parse)
                .collect(Collectors.toUnmodifiableSet());
    }

    public SlaMetrics snapshot(Ticket ticket) {
        TicketPriority priority = ticket.getPriority();
        if (priority == null) {
            return null;
        }

        Instant now = clock.instant();
        Instant firstResponseEnd = ticket.getFirstResponseAt() == null
                ? now : ticket.getFirstResponseAt();
        Instant resolutionEnd = ticket.getResolvedAt() == null
                ? now : ticket.getResolvedAt();
        Instant tmrDeadline = addCoveredTime(
                ticket.getOpenedAt(), priority.getFirstResponseTarget(), priority);
        Instant tmsDeadline = addCoveredTime(
                ticket.getOpenedAt(), priority.getResolutionTarget(), priority);

        return new SlaMetrics(
                priority,
                priority.getFirstResponseTarget().toMinutes(),
                priority.getResolutionTarget().toMinutes(),
                tmrDeadline,
                tmsDeadline,
                coveredMinutesBetween(ticket.getOpenedAt(), firstResponseEnd, priority),
                coveredMinutesBetween(ticket.getOpenedAt(), resolutionEnd, priority),
                ticket.getFirstResponseAt() == null
                        ? now.isAfter(tmrDeadline)
                        : ticket.getFirstResponseAt().isAfter(tmrDeadline),
                ticket.getResolvedAt() == null
                        ? now.isAfter(tmsDeadline)
                        : ticket.getResolvedAt().isAfter(tmsDeadline));
    }

    private Instant addCoveredTime(Instant start, Duration target,
                                   TicketPriority priority) {
        if (priority.hasContinuousCoverage()) {
            return start.plus(target);
        }

        Duration remaining = target;
        Instant cursor = start;
        while (!remaining.isZero()) {
            ZonedDateTime localCursor = cursor.atZone(zone);
            LocalDate date = localCursor.toLocalDate();
            if (!isCoveredDate(date, priority)) {
                cursor = nextDayAtCoverageStart(date);
                continue;
            }

            Instant windowStart = date.atTime(COVERAGE_START).atZone(zone).toInstant();
            Instant windowEnd = date.atTime(COVERAGE_END).atZone(zone).toInstant();
            Instant coveredStart = cursor.isAfter(windowStart) ? cursor : windowStart;
            if (!coveredStart.isBefore(windowEnd)) {
                cursor = nextDayAtCoverageStart(date);
                continue;
            }

            Duration available = Duration.between(coveredStart, windowEnd);
            if (remaining.compareTo(available) <= 0) {
                return coveredStart.plus(remaining);
            }

            remaining = remaining.minus(available);
            cursor = nextDayAtCoverageStart(date);
        }
        return cursor;
    }

    private long coveredMinutesBetween(Instant start, Instant end,
                                       TicketPriority priority) {
        if (!end.isAfter(start)) {
            return 0;
        }
        if (priority.hasContinuousCoverage()) {
            return Duration.between(start, end).toMinutes();
        }

        LocalDate date = start.atZone(zone).toLocalDate();
        LocalDate lastDate = end.atZone(zone).toLocalDate();
        Duration covered = Duration.ZERO;
        while (!date.isAfter(lastDate)) {
            if (isCoveredDate(date, priority)) {
                Instant windowStart = date.atTime(COVERAGE_START).atZone(zone).toInstant();
                Instant windowEnd = date.atTime(COVERAGE_END).atZone(zone).toInstant();
                Instant overlapStart = start.isAfter(windowStart) ? start : windowStart;
                Instant overlapEnd = end.isBefore(windowEnd) ? end : windowEnd;
                if (overlapEnd.isAfter(overlapStart)) {
                    covered = covered.plus(Duration.between(overlapStart, overlapEnd));
                }
            }
            date = date.plusDays(1);
        }
        return covered.toMinutes();
    }

    private boolean isCoveredDate(LocalDate date, TicketPriority priority) {
        if (holidays.contains(date)) {
            return false;
        }
        return switch (priority) {
            case P2, P3 -> date.getDayOfWeek().getValue() <= 6;
            case P4 -> date.getDayOfWeek().getValue() <= 5;
            case P1 -> true;
        };
    }

    private Instant nextDayAtCoverageStart(LocalDate date) {
        return date.plusDays(1).atTime(COVERAGE_START).atZone(zone).toInstant();
    }

    public record SlaMetrics(
            TicketPriority priority,
            long tmrTargetMinutes,
            long tmsTargetMinutes,
            Instant tmrDeadlineAt,
            Instant tmsDeadlineAt,
            long tmrConsumedMinutes,
            long tmsConsumedMinutes,
            boolean tmrBreached,
            boolean tmsBreached) {
    }
}
