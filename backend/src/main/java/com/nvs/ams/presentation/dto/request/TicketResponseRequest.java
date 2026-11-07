package com.nvs.ams.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TicketResponseRequest(
        @NotBlank(message = "A resposta é obrigatória")
        @Size(max = 2000, message = "A resposta deve ter no máximo 2000 caracteres")
        String message
) {
}
