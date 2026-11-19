package com.nvs.ams.presentation.controller;

import com.nvs.ams.infra.repositories.CategoryRepository;
import com.nvs.ams.infra.repositories.LocationRepository;
import com.nvs.ams.infra.repositories.TeamRepository;
import com.nvs.ams.presentation.dto.response.CategoryResponse;
import com.nvs.ams.presentation.dto.response.LocationResponse;
import com.nvs.ams.presentation.dto.response.TeamResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CatalogController {

    private final LocationRepository locations;
    private final CategoryRepository categories;
    private final TeamRepository teams;

    @GetMapping("/stores")
    public List<LocationResponse> stores() {
        return locations.findAll().stream().map(LocationResponse::from).toList();
    }

    @GetMapping("/categories")
    public List<CategoryResponse> categories() {
        return categories.findAll().stream().map(CategoryResponse::from).toList();
    }

    @GetMapping("/teams")
    public List<TeamResponse> teams() {
        return teams.findAll().stream().map(TeamResponse::from).toList();
    }
}
