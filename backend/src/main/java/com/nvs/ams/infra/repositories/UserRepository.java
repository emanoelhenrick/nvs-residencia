package com.nvs.ams.infra.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nvs.ams.domain.models.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    UserDetails findUserDetailsByEmail(String email);
    Optional<User> findUserByEmail(String email);
}
