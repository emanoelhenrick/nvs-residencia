package com.nvs.ams.presentation.dto.response;

public record AuthResponse(
        String token,
        String name,
        String email,
        String role
) {
}
