package com.nvs.ams.presentation.dto.response;

import com.nvs.ams.domain.models.Team;

public record TeamResponse(
        Long id,
        String name,
        String level
) {
    public static TeamResponse from(Team team) {
        return new TeamResponse(team.getId(), team.getName(), team.getLevel().name());
    }
}
