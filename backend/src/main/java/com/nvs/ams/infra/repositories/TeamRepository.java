package com.nvs.ams.infra.repositories;

import com.nvs.ams.domain.models.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {
}
