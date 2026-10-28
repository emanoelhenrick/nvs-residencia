package com.nvs.ams.presentation.dto;

import com.nvs.ams.domain.models.Category;
import com.nvs.ams.domain.models.Location;
import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.enums.TicketPriority;
import com.nvs.ams.domain.models.enums.TicketStatus;
import com.nvs.ams.presentation.dto.response.TicketResponse;
import com.nvs.ams.services.SlaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

class TicketResponseTest {

    @Test
    @DisplayName("Deve mapear corretamente todos os campos da entidade Ticket para TicketResponse sem SLA")
    void shouldMapTicketToTicketResponseWithoutSla() {
        Category category = new Category();
        category.setName("PDV");

        Location location = new Location();
        location.setName("Loja Centro");

        Instant now = Instant.now();

        Ticket ticket = new Ticket();
        ticket.setProtocol("NX-2026-123456");
        ticket.setDescription("Falha de comunicação");
        ticket.setCategory(category);
        ticket.setLocation(location);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setOpenedAt(now);

        TicketResponse response = TicketResponse.from(ticket);

        assertNotNull(response);
        assertEquals("NX-2026-123456", response.protocol());
        assertEquals("Falha de comunicação", response.description());
        assertEquals("PDV", response.category());
        assertEquals("Loja Centro", response.location());
        assertEquals("IN_PROGRESS", response.status());
        assertEquals(now, response.openedAt());
        assertNull(response.sla());
    }

    @Test
    @DisplayName("Deve mapear corretamente Ticket com métricas de SLA usando SlaService")
    void shouldMapTicketToTicketResponseWithSla() {
        Category category = new Category();
        category.setName("PDV");

        Location location = new Location();
        location.setName("Loja Centro");

        Instant openedAt = Instant.parse("2026-10-09T20:00:00Z");

        Ticket ticket = new Ticket();
        ticket.setProtocol("NX-2026-123456");
        ticket.setDescription("Falha de comunicação");
        ticket.setCategory(category);
        ticket.setLocation(location);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setOpenedAt(openedAt);
        ticket.setPriority(TicketPriority.P1);

        SlaService slaService = new SlaService(Clock.fixed(openedAt, ZoneOffset.UTC), "America/Recife", "");

        TicketResponse response = TicketResponse.from(ticket, slaService);

        assertNotNull(response);
        assertEquals("NX-2026-123456", response.protocol());
        assertNotNull(response.sla());
        assertEquals("P1", response.sla().priority());
        assertEquals(15, response.sla().tmrTargetMinutes());
        assertEquals(120, response.sla().tmsTargetMinutes());
    }
}
