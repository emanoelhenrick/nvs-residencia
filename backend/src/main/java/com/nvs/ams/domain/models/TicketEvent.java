package com.nvs.ams.domain.models;

import com.nvs.ams.domain.models.enums.EventType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Immutable // o Hibernate não gera UPDATE para esta entidade
@Table(name = "ticket_event", indexes = {
@Index(name = "idx_event_ticket_created", columnList = "ticket_id, created_at")
})
@Getter
@NoArgsConstructor
public class TicketEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id", updatable = false)
    private Ticket ticket;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false, length = 30)
    private EventType type;

    // Nulo quando o autor é o próprio sistema
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", updatable = false)
    private User actor;

    // Detalhes livres (valor antigo/novo, justificativa...) em JSONB
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", updatable = false)
    private Map<String, Object> payload;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public TicketEvent(Ticket ticket, EventType type, User actor,
                       Map<String, Object> payload) {
        this.ticket = ticket;
        this.type = type;
        this.actor = actor;
        this.payload = payload;
    }
}
