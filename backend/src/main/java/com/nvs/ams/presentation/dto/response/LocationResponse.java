package com.nvs.ams.presentation.dto.response;

import com.nvs.ams.domain.models.Location;

public record LocationResponse(
        Long id,
        String code,
        String name,
        String type
) {
    public static LocationResponse from(Location location) {
        return new LocationResponse(
                location.getId(),
                location.getCode(),
                location.getName(),
                location.getType().name());
    }
}
