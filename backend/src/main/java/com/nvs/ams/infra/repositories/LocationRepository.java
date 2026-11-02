package com.nvs.ams.infra.repositories;

import com.nvs.ams.domain.models.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {
}
