package com.nvs.ams.domain.models;

import com.nvs.ams.domain.models.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "ticket", indexes = {
@Index(name = "idx_ticket_status_opened", columnList = "status, opened_at"),
@Index(name = "idx_ticket_category_location_opened",
columnList = "category_id, location_id, opened_at")
})
@Getter
@Setter
@NoArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ex.: NX-2026-000001 (gerado no service, com sequence do banco)
    @Column(nullable = false, unique = true, updatable = false, length = 30)
    private String protocol;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    // Capturados da sessão, nunca digitados pelo usuário
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", updatable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", updatable = false)
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", updatable = false)
    private Device device;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TicketStatus status = TicketStatus.OPEN;

    // Preenchido pela triagem
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_team_id")
    private Team assignedTeam;

    @Column(name = "opened_at", nullable = false, updatable = false)
    private Instant openedAt;

    @PrePersist
    void onCreate() {
        this.openedAt = Instant.now();
    }
}
