package com.nvs.ams.infra.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nvs.ams.domain.models.TicketEvent;

public interface TicketEventRepository extends JpaRepository<TicketEvent, Long> {
    List<TicketEvent> findByTicket_IdOrderByCreatedAtAsc(Long ticketId);
}
