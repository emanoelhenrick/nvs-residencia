package com.nvs.ams.services;

import com.nvs.ams.domain.models.SlaViolation;
import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.User;
import com.nvs.ams.domain.models.enums.UserRole;
import com.nvs.ams.infra.repositories.SlaViolationRepository;
import com.nvs.ams.infra.repositories.TicketRepository;
import com.nvs.ams.infra.repositories.UserRepository;
import com.nvs.ams.presentation.dto.response.SlaReportResponse;
import com.nvs.ams.presentation.dto.response.SlaViolationResponse;
import com.nvs.ams.presentation.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class SlaReportingService {

    private final UserRepository users;
    private final TicketRepository tickets;
    private final SlaViolationRepository violations;
    private final SlaService slaService;

    public SlaReportingService(UserRepository users, TicketRepository tickets,
                               SlaViolationRepository violations,
                               SlaService slaService) {
        this.users = users;
        this.tickets = tickets;
        this.violations = violations;
        this.slaService = slaService;
    }

    @Transactional(readOnly = true)
    public SlaReportResponse report(Long userId, LocalDate from, LocalDate to) {
        requireSupportUser(userId);
        validateRange(from, to);
        Instant start = from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end = to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        List<Ticket> periodTickets =
                tickets.findByOpenedAtGreaterThanEqualAndOpenedAtLessThan(start, end);
        Map<String, MutableMetrics> priorityMetrics = new TreeMap<>();
        Map<String, MutableMetrics> teamMetrics = new TreeMap<>();

        for (Ticket ticket : periodTickets) {
            SlaService.SlaMetrics metrics = slaService.snapshot(ticket);
            if (metrics == null) {
                continue;
            }
            String priority = metrics.priority().name();
            String team = ticket.getAssignedTeam() == null
                    ? "UNASSIGNED" : ticket.getAssignedTeam().getName();
            add(priorityMetrics, priority, ticket, metrics);
            add(teamMetrics, team, ticket, metrics);
        }
        return new SlaReportResponse(
                from, to, toResponse("priority", priorityMetrics),
                toResponse("team", teamMetrics));
    }

    @Transactional(readOnly = true)
    public List<SlaViolationResponse> violations(Long userId,
                                                 LocalDate from, LocalDate to) {
        requireSupportUser(userId);
        validateRange(from, to);
        Instant start = from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end = to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        return violations
                .findByDetectedAtGreaterThanEqualAndDetectedAtLessThanOrderByDetectedAtDesc(
                        start, end)
                .stream().map(SlaViolationResponse::from).toList();
    }

    private void add(Map<String, MutableMetrics> totals, String key, Ticket ticket,
                     SlaService.SlaMetrics metrics) {
        MutableMetrics value = totals.computeIfAbsent(key, ignored -> new MutableMetrics());
        value.ticketCount++;
        boolean tmrMeasured = ticket.getFirstResponseAt() != null || metrics.tmrBreached();
        if (tmrMeasured) {
            value.tmrMeasuredCount++;
            if (metrics.tmrBreached()) {
                value.tmrViolationCount++;
            } else {
                value.tmrCompliantCount++;
            }
        }
        boolean tmsMeasured = ticket.getResolvedAt() != null || metrics.tmsBreached();
        if (tmsMeasured) {
            value.tmsMeasuredCount++;
            if (metrics.tmsBreached()) {
                value.tmsViolationCount++;
            } else {
                value.tmsCompliantCount++;
            }
        }
    }

    private List<SlaReportResponse.DimensionMetrics> toResponse(
            String dimension, Map<String, MutableMetrics> values) {
        return values.entrySet().stream()
                .map(entry -> {
                    MutableMetrics m = entry.getValue();
                    return new SlaReportResponse.DimensionMetrics(
                            dimension, entry.getKey(), m.ticketCount,
                            m.tmrMeasuredCount, m.tmrCompliantCount,
                            m.tmrViolationCount, percent(m.tmrCompliantCount, m.tmrMeasuredCount),
                            m.tmsMeasuredCount, m.tmsCompliantCount,
                            m.tmsViolationCount, percent(m.tmsCompliantCount, m.tmsMeasuredCount));
                }).toList();
    }

    private double percent(long compliant, long measured) {
        return measured == 0 ? 0 : Math.round(compliant * 10000.0 / measured) / 100.0;
    }

    private void requireSupportUser(Long userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));
        if (user.getRole() == UserRole.REQUESTER) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Somente a equipe de suporte pode consultar relatórios de SLA");
        }
    }

    private void validateRange(LocalDate from, LocalDate to) {
        if (from == null || to == null || to.isBefore(from)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Informe um período válido com data inicial e final");
        }
    }

    private static class MutableMetrics {
        private long ticketCount;
        private long tmrMeasuredCount;
        private long tmrCompliantCount;
        private long tmrViolationCount;
        private long tmsMeasuredCount;
        private long tmsCompliantCount;
        private long tmsViolationCount;
    }
}
