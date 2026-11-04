package com.nvs.ams.presentation.dto.response;

import java.time.Instant;

import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.services.SlaService;

public record TicketResponse(
        Long id,
        String protocol,
        String description,
        String category,
        String location,
        String status,
        Instant openedAt,
        Instant firstResponseAt,
        Instant resolvedAt,
        TicketSlaResponse sla
) {
    public static TicketResponse from(Ticket t, SlaService slaService) {
        return new TicketResponse(
                t.getId(), t.getProtocol(), t.getDescription(),
                t.getCategory().getName(), t.getLocation().getName(),
                t.getStatus().name(), t.getOpenedAt(), t.getFirstResponseAt(),
                t.getResolvedAt(), TicketSlaResponse.from(slaService.snapshot(t)));
    }
}
