package com.nvs.ams.domain.models;

import com.nvs.ams.domain.models.enums.SlaMetric;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "sla_violation", uniqueConstraints = {
        @UniqueConstraint(name = "uq_sla_violation_ticket_metric_deadline",
                columnNames = {"ticket_id", "metric", "deadline_at"})
}, indexes = @Index(name = "idx_sla_violation_detected_at", columnList = "detected_at"))
@Getter
@NoArgsConstructor
public class SlaViolation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id", nullable = false, updatable = false)
    private Ticket ticket;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false, length = 3)
    private SlaMetric metric;

    @Column(name = "deadline_at", nullable = false, updatable = false)
    private Instant deadlineAt;

    @Column(name = "detected_at", nullable = false, updatable = false)
    private Instant detectedAt;

    public SlaViolation(Ticket ticket, SlaMetric metric, Instant deadlineAt,
                        Instant detectedAt) {
        this.ticket = ticket;
        this.metric = metric;
        this.deadlineAt = deadlineAt;
        this.detectedAt = detectedAt;
    }
}
