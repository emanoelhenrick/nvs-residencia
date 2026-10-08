package com.nvs.ams.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTicketRequest(
        @NotBlank (message = "A descrição é obrigatória")
        @Size (min = 10, max = 2000,
              message = "A descrição deve ter entre 10 e 2000 caracteres")
        String description,

        @NotNull(message = "A categoria é obrigatória")
        Long categoryId
) {}
