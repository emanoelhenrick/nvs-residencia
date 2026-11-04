package com.nvs.ams.services;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.TicketEvent;
import com.nvs.ams.domain.models.enums.EventType;
import com.nvs.ams.domain.models.enums.TicketStatus;
import com.nvs.ams.infra.repositories.TicketEventRepository;
import com.nvs.ams.infra.repositories.TicketRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SlaScheduler {

    private final TicketRepository tickets;
    private final TicketEventRepository events;
    private final SlaService slaService;
    private final Clock clock;

    @org.springframework.beans.factory.annotation.Value("${nvs.sla.auto-close-hours:48}")
    private long autoCloseHours;

    @Scheduled(fixedDelayString = "${nvs.sla.scheduler-delay-ms:60000}")
    @Transactional
    public void checkSlaRules() {
        Instant now = clock.instant();
        List<Ticket> allTickets = tickets.findAll();

        for (Ticket ticket : allTickets) {
            if (ticket.getPriority() != null
                    && ticket.getSla80AlertedAt() == null
                    && isOpenForService(ticket.getStatus())) {
                SlaService.SlaMetrics metrics = slaService.snapshot(ticket);
                if (metrics != null && metrics.resolutionWarning80Percent()) {
                    ticket.setSla80AlertedAt(now);
                    events.save(new TicketEvent(ticket, EventType.SLA_WARNING_80, null,
                            Map.of(
                                    "thresholdPercent", 80,
                                    "consumedMinutes", metrics.tmsConsumedMinutes(),
                                    "targetMinutes", metrics.tmsTargetMinutes(),
                                    "priority", metrics.priority().name())));
                }
            }

            if (ticket.getStatus() == TicketStatus.RESOLVED
                    && ticket.getResolvedAt() != null
                    && !now.isBefore(ticket.getResolvedAt().plus(Duration.ofHours(autoCloseHours)))
                    && (ticket.getRequesterLastResponseAt() == null
                        || !ticket.getRequesterLastResponseAt().isAfter(ticket.getResolvedAt()))) {
                ticket.setStatus(TicketStatus.CLOSED);
                ticket.setClosedAt(now);
                events.save(new TicketEvent(ticket, EventType.AUTO_CLOSED, null,
                        Map.of(
                                "closedAt", now.toString(),
                                "reason", "RESOLVED_WITHOUT_REQUESTER_REPLY_FOR_48_HOURS",
                                "resolvedAt", ticket.getResolvedAt().toString())));
                events.save(new TicketEvent(ticket, EventType.STATUS_CHANGED, null,
                        Map.of("previousStatus", TicketStatus.RESOLVED.name(),
                                "status", TicketStatus.CLOSED.name())));
            }
        }
    }

    private boolean isOpenForService(TicketStatus status) {
        return status != TicketStatus.RESOLVED
                && status != TicketStatus.CLOSED
                && status != TicketStatus.CANCELLED;
    }
}
