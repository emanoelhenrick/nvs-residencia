package com.nvs.ams.infra.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nvs.ams.domain.models.TicketEvent;

public interface TicketEventRepository extends JpaRepository<TicketEvent, Long> {}
