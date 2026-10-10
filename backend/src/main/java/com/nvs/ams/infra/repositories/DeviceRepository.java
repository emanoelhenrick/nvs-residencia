package com.nvs.ams.infra.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nvs.ams.domain.models.Device;

public interface DeviceRepository extends JpaRepository<Device, Long> {}
