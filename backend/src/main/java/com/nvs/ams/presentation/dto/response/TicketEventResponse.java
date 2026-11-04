package com.nvs.ams.presentation.dto.response;

import java.time.Instant;
import java.util.Map;

import com.nvs.ams.domain.models.TicketEvent;

public record TicketEventResponse(
        Long id,
        String type,
        String actor,
        Map<String, Object> payload,
        Instant createdAt
) {
    public static TicketEventResponse from(TicketEvent event) {
        return new TicketEventResponse(
                event.getId(),
                event.getType().name(),
                event.getActor() == null ? "SYSTEM" : event.getActor().getName(),
                event.getPayload(),
                event.getCreatedAt());
    }
}
