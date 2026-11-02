package com.nvs.ams.presentation.dto.request;

import com.nvs.ams.domain.models.enums.TicketPriority;
import jakarta.validation.constraints.NotNull;

public record SetTicketPriorityRequest(
        @NotNull(message = "A prioridade é obrigatória")
        TicketPriority priority
) {
}
