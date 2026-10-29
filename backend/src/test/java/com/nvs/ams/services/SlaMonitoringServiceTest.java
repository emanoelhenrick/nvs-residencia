package com.nvs.ams.services;

import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.enums.EventType;
import com.nvs.ams.domain.models.enums.TicketStatus;
import com.nvs.ams.infra.repositories.SlaViolationRepository;
import com.nvs.ams.infra.repositories.TicketEventRepository;
import com.nvs.ams.infra.repositories.TicketRepository;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SlaMonitoringServiceTest {

    @Test
    void closesResolvedTicketAfterFortyEightHoursWithoutRequesterReply() {
        Instant now = Instant.parse("2026-10-12T00:00:00Z");
        Ticket ticket = new Ticket();
        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolvedAt(now.minusSeconds(48 * 60 * 60));

        TicketRepository tickets = mock(TicketRepository.class);
        TicketEventRepository events = mock(TicketEventRepository.class);
        SlaViolationRepository violations = mock(SlaViolationRepository.class);
        when(tickets.findAll()).thenReturn(List.of(ticket));
        when(events.findByTicketIdAndTypeAndCreatedAtAfter(
                org.mockito.ArgumentMatchers.nullable(Long.class),
                eq(EventType.COMMENTED), any(Instant.class))).thenReturn(List.of());

        SlaMonitoringService service = new SlaMonitoringService(
                tickets, events, violations,
                new SlaService(Clock.fixed(now, ZoneOffset.UTC),
                        "America/Recife", ""),
                Clock.fixed(now, ZoneOffset.UTC));

        service.monitor();

        assertEquals(TicketStatus.CLOSED, ticket.getStatus());
        verify(events).save(any());
    }

    @Test
    void doesNotCloseResolvedTicketBeforeFortyEightHours() {
        Instant now = Instant.parse("2026-10-12T00:00:00Z");
        Ticket ticket = new Ticket();
        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolvedAt(now.minusSeconds(48 * 60 * 60 - 1));

        TicketRepository tickets = mock(TicketRepository.class);
        TicketEventRepository events = mock(TicketEventRepository.class);
        SlaViolationRepository violations = mock(SlaViolationRepository.class);
        when(tickets.findAll()).thenReturn(List.of(ticket));

        SlaMonitoringService service = new SlaMonitoringService(
                tickets, events, violations,
                new SlaService(Clock.fixed(now, ZoneOffset.UTC),
                        "America/Recife", ""),
                Clock.fixed(now, ZoneOffset.UTC));

        service.monitor();

        assertEquals(TicketStatus.RESOLVED, ticket.getStatus());
        org.mockito.Mockito.verifyNoInteractions(events);
    }
}
