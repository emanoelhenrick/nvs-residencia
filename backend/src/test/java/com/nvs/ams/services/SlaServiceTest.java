package com.nvs.ams.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.enums.TicketPriority;

class SlaServiceTest {

    @Test
    void calculatesContinuousPriorityDeadlinesFromOpeningTime() {
        SlaService service = serviceAt("2026-10-09T20:00:00Z", "");
        Ticket ticket = ticket("2026-10-09T20:00:00Z", TicketPriority.P1);

        SlaService.SlaMetrics metrics = service.snapshot(ticket);

        assertEquals(15, metrics.tmrTargetMinutes());
        assertEquals(120, metrics.tmsTargetMinutes());
        assertEquals(Instant.parse("2026-10-09T20:15:00Z"), metrics.tmrDeadlineAt());
        assertEquals(Instant.parse("2026-10-09T22:00:00Z"), metrics.tmsDeadlineAt());
    }

    @Test
    void countsP2CoverageOnSaturdayAndExcludesOvernightTime() {
        SlaService service = serviceAt("2026-10-09T20:45:00Z", "");
        Ticket ticket = ticket("2026-10-09T20:45:00Z", TicketPriority.P2);

        SlaService.SlaMetrics metrics = service.snapshot(ticket);

        assertEquals(Instant.parse("2026-10-10T11:15:00Z"), metrics.tmrDeadlineAt());
        assertEquals(Instant.parse("2026-10-10T16:45:00Z"), metrics.tmsDeadlineAt());
        assertEquals(0, metrics.tmrConsumedMinutes());
        assertFalse(metrics.tmrBreached());
    }

    @Test
    void countsP4CoverageOnlyOnWeekdays() {
        SlaService service = serviceAt("2026-10-09T20:00:00Z", "");
        Ticket ticket = ticket("2026-10-09T20:00:00Z", TicketPriority.P4);

        SlaService.SlaMetrics metrics = service.snapshot(ticket);

        assertEquals(Instant.parse("2026-10-12T14:00:00Z"), metrics.tmrDeadlineAt());
        assertEquals(Instant.parse("2026-10-21T12:00:00Z"), metrics.tmsDeadlineAt());
    }

    @Test
    void appliesP3TargetsWithinMondayThroughSaturdayCoverage() {
        SlaService service = serviceAt("2026-10-09T20:00:00Z", "");
        Ticket ticket = ticket("2026-10-09T20:00:00Z", TicketPriority.P3);

        SlaService.SlaMetrics metrics = service.snapshot(ticket);

        assertEquals(120, metrics.tmrTargetMinutes());
        assertEquals(1440, metrics.tmsTargetMinutes());
        assertEquals(Instant.parse("2026-10-10T12:00:00Z"), metrics.tmrDeadlineAt());
        assertEquals(Instant.parse("2026-10-13T14:00:00Z"), metrics.tmsDeadlineAt());
    }

    @Test
    void skipsConfiguredHolidaysForBusinessHourPriorities() {
        SlaService service = serviceAt("2026-10-09T20:45:00Z", "2026-10-10");
        Ticket ticket = ticket("2026-10-09T20:45:00Z", TicketPriority.P2);

        SlaService.SlaMetrics metrics = service.snapshot(ticket);

        assertEquals(Instant.parse("2026-10-12T11:15:00Z"), metrics.tmrDeadlineAt());
    }

    @Test
    void calculatesConsumedTimeAndBreachFromEffectiveResponseTime() {
        SlaService service = serviceAt("2026-10-10T12:00:00Z", "");
        Ticket ticket = ticket("2026-10-09T20:45:00Z", TicketPriority.P2);
        ticket.setFirstResponseAt(Instant.parse("2026-10-10T11:30:00Z"));

        SlaService.SlaMetrics metrics = service.snapshot(ticket);

        assertEquals(45, metrics.tmrConsumedMinutes());
        assertTrue(metrics.tmrBreached());
    }

    private static SlaService serviceAt(String now, String holidays) {
        return new SlaService(
                Clock.fixed(Instant.parse(now), ZoneOffset.UTC),
                "America/Recife",
                holidays);
    }

    private static Ticket ticket(String openedAt, TicketPriority priority) {
        Ticket ticket = new Ticket();
        ticket.setOpenedAt(Instant.parse(openedAt));
        ticket.setPriority(priority);
        return ticket;
    }
}
