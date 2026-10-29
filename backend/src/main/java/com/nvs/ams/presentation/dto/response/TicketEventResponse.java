package com.nvs.ams.presentation.dto.response;

import com.nvs.ams.domain.models.TicketEvent;

import java.time.Instant;
import java.util.Map;

public record TicketEventResponse(
        String type,
        String actor,
        Instant createdAt,
        Map<String, Object> payload
) {
    public static TicketEventResponse from(TicketEvent event) {
        return new TicketEventResponse(
                event.getType().name(),
                event.getActor() == null ? "SYSTEM" : event.getActor().getName(),
                event.getCreatedAt(),
                event.getPayload());
    }
}
