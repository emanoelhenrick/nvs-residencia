package com.nvs.ams.presentation.dto.response;

import com.nvs.ams.domain.models.User;

public record SessionResponse(
        Long id,
        String name,
        String email,
        String role,
        LocationResponse location,
        TeamResponse team
) {
    public static SessionResponse from(User user) {
        return new SessionResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getLocation() == null ? null : LocationResponse.from(user.getLocation()),
                user.getTeam() == null ? null : TeamResponse.from(user.getTeam()));
    }
}
