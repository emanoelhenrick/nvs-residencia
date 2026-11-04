package com.nvs.ams.infra.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.nvs.ams.domain.models.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Número da sequence que gera o protocolo
    @Query (value = "SELECT nextval('ticket_protocol_seq')", nativeQuery = true)
    long nextProtocolNumber();

    List<Ticket> findByRequesterIdOrderByOpenedAtDesc(Long requesterId);

    List<Ticket> findAllByOrderByOpenedAtDesc();
}
