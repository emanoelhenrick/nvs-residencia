package com.nvs.ams.presentation.dto.response;

import com.nvs.ams.domain.models.Category;

public record CategoryResponse(Long id, String name) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(category.getId(), category.getName());
    }
}
