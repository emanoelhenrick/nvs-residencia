package com.nvs.ams.presentation.dto.request;

import com.nvs.ams.domain.models.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;

public record RegisterStaffRequest(
        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 255, message = "O nome deve ter no máximo 255 caracteres")
        String name,

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "O email deve ser válido")
        @Size(max = 255, message = "O email deve ter no máximo 255 caracteres")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres")
        String password,

        @NotNull(message = "O perfil é obrigatório")
        UserRole role,

        @Positive(message = "A equipe deve ser válida")
        Long teamId
) {
}
