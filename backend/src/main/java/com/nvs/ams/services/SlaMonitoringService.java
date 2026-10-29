package com.nvs.ams.services;

import com.nvs.ams.domain.models.SlaViolation;
import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.TicketEvent;
import com.nvs.ams.domain.models.enums.EventType;
import com.nvs.ams.domain.models.enums.SlaMetric;
import com.nvs.ams.domain.models.enums.TicketStatus;
import com.nvs.ams.domain.models.enums.UserRole;
import com.nvs.ams.infra.repositories.SlaViolationRepository;
import com.nvs.ams.infra.repositories.TicketEventRepository;
import com.nvs.ams.infra.repositories.TicketRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@Service
public class SlaMonitoringService {

    private static final Duration AUTO_CLOSE_AFTER = Duration.ofHours(48);

    private final TicketRepository tickets;
    private final TicketEventRepository events;
    private final SlaViolationRepository violations;
    private final SlaService slaService;
    private final Clock clock;

    public SlaMonitoringService(TicketRepository tickets,
                                TicketEventRepository events,
                                SlaViolationRepository violations,
                                SlaService slaService,
                                Clock clock) {
        this.tickets = tickets;
        this.events = events;
        this.violations = violations;
        this.slaService = slaService;
        this.clock = clock;
    }

    @Scheduled(fixedDelayString = "${nvs.sla.monitor-interval-ms:60000}")
    @Transactional
    public void monitor() {
        Instant now = clock.instant();
        for (Ticket ticket : tickets.findAll()) {
            closeResolvedTicketIfDue(ticket, now);
            SlaService.SlaMetrics metrics = slaService.snapshot(ticket);
            if (metrics == null) {
                continue;
            }
            recordAlerts(ticket, metrics);
            recordViolation(ticket, SlaMetric.TMR, metrics.tmrDeadlineAt(),
                    metrics.tmrBreached(), now);
            recordViolation(ticket, SlaMetric.TMS, metrics.tmsDeadlineAt(),
                    metrics.tmsBreached(), now);
        }
    }

    private void closeResolvedTicketIfDue(Ticket ticket, Instant now) {
        Instant resolvedAt = ticket.getResolvedAt();
        if (ticket.getStatus() != TicketStatus.RESOLVED || resolvedAt == null
                || now.isBefore(resolvedAt.plus(AUTO_CLOSE_AFTER))) {
            return;
        }
        boolean hasRequesterResponse = events.findByTicketIdAndTypeAndCreatedAtAfter(
                        ticket.getId(), EventType.COMMENTED, resolvedAt)
                .stream()
                .anyMatch(this::isRequesterComment);
        if (hasRequesterResponse) {
            return;
        }
        ticket.setStatus(TicketStatus.CLOSED);
        events.save(new TicketEvent(ticket, EventType.STATUS_CHANGED, null,
                Map.of("status", TicketStatus.CLOSED.name(), "automatic", true)));
    }

    private void recordAlerts(Ticket ticket, SlaService.SlaMetrics metrics) {
        if (ticket.getStatus() == TicketStatus.RESOLVED
                || ticket.getStatus() == TicketStatus.CLOSED
                || ticket.getStatus() == TicketStatus.CANCELLED) {
            return;
        }
        if (metrics.tmrWarningDue() && !ticket.isTmrAlertSent()) {
            events.save(new TicketEvent(ticket, EventType.SLA_ALERT, null,
                    Map.of("metric", "TMR", "thresholdPercent", 80,
                            "deadlineAt", metrics.tmrDeadlineAt().toString())));
            ticket.setTmrAlertSent(true);
        }
        if (metrics.tmsWarningDue() && !ticket.isTmsAlertSent()) {
            events.save(new TicketEvent(ticket, EventType.SLA_ALERT, null,
                    Map.of("metric", "TMS", "thresholdPercent", 80,
                            "deadlineAt", metrics.tmsDeadlineAt().toString())));
            ticket.setTmsAlertSent(true);
        }
    }

    private void recordViolation(Ticket ticket, SlaMetric metric, Instant deadlineAt,
                                boolean breached, Instant detectedAt) {
        if (breached && !violations.existsByTicketIdAndMetricAndDeadlineAt(
                ticket.getId(), metric, deadlineAt)) {
            violations.save(new SlaViolation(ticket, metric, deadlineAt, detectedAt));
        }
    }

    private boolean isRequesterComment(TicketEvent event) {
        return event.getActor() != null
                && event.getActor().getRole() == UserRole.REQUESTER;
    }
}
