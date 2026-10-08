package com.nvs.ams.presentation.dto.response;

import java.time.Instant;

import com.nvs.ams.domain.models.Ticket;

public record TicketResponse(
        Long id,
        String protocol,
        String description,
        String category,
        String location,
        String status,
        Instant openedAt
) {
    public static TicketResponse from(Ticket t) {
        return new TicketResponse(
                t.getId(), t.getProtocol(), t.getDescription(),
                t.getCategory().getName(), t.getLocation().getName(),
                t.getStatus().name(), t.getOpenedAt());
    }
}
