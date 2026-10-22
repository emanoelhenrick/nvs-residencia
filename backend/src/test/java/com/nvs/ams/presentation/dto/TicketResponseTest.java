package com.nvs.ams.presentation.dto;

import com.nvs.ams.domain.models.Category;
import com.nvs.ams.domain.models.Location;
import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.enums.TicketStatus;
import com.nvs.ams.presentation.dto.response.TicketResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class TicketResponseTest {

    @Test
    @DisplayName("Deve mapear corretamente todos os campos da entidade Ticket para TicketResponse")
    void shouldMapTicketToTicketResponse() {
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
    }
}
