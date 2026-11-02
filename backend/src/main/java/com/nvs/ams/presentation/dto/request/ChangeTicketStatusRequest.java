package com.nvs.ams.presentation.dto.request;

import com.nvs.ams.domain.models.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeTicketStatusRequest(@NotNull TicketStatus status) {
}
