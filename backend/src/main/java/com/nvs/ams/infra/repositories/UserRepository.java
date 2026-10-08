package com.nvs.ams.infra.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nvs.ams.domain.models.User;

public interface UserRepository extends JpaRepository<User, Long> {}
