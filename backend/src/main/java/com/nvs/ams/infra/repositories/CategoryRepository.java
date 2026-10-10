package com.nvs.ams.infra.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nvs.ams.domain.models.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {}
