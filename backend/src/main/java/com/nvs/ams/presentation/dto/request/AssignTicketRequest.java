package com.nvs.ams.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AssignTicketRequest(@NotNull @Positive Long teamId) {
}
