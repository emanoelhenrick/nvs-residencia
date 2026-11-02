package com.nvs.ams.infra.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nvs.ams.domain.models.TicketEvent;
import com.nvs.ams.domain.models.enums.EventType;

import java.time.Instant;
import java.util.List;

public interface TicketEventRepository extends JpaRepository<TicketEvent, Long> {

    List<TicketEvent> findByTicketIdAndTypeAndCreatedAtAfter(
            Long ticketId, EventType type, Instant createdAt);

    List<TicketEvent> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
