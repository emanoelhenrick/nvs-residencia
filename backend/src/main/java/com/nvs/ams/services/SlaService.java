package com.nvs.ams.services;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.enums.TicketPriority;

@Service
public class SlaService {

    private static final LocalTime COVERAGE_START = LocalTime.of(8, 0);//janela de atendimento
    private static final LocalTime COVERAGE_END = LocalTime.of(18, 0);

    private final Clock clock;
    private final ZoneId zone;
    private final Set<LocalDate> holidays;

    public SlaService(Clock clock,//Configura o relógio, o fuso horário e os feriados utilizados no cálculo do SLA.
                      @Value("${nvs.sla.time-zone:America/Recife}") String timeZone,
                      @Value("${nvs.sla.holidays:}") String holidayDates) {
        this.clock = clock;
        this.zone = ZoneId.of(timeZone);
        this.holidays = Arrays.stream(holidayDates.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(LocalDate::parse)
                .collect(Collectors.toUnmodifiableSet());
    }

    public SlaMetrics snapshot(Ticket ticket) {//recebe o chamado e verifica a prioridade
        TicketPriority priority = ticket.getPriority();
        if (priority == null) {
            return null;//não produz métricas por enquanto
        }

        Instant now = clock.instant();
        Instant activeEnd = ticket.getSlaPausedAt() == null
                ? now : ticket.getSlaPausedAt();
        Instant firstResponseEnd = ticket.getFirstResponseAt() == null
                ? activeEnd : ticket.getFirstResponseAt();
        Instant resolutionEnd = ticket.getResolvedAt() == null
                ? activeEnd : ticket.getResolvedAt();

        long tmrConsumedSeconds = Math.max(0,
                coveredSecondsBetween(ticket.getOpenedAt(), firstResponseEnd, priority)
                        - ticket.getTmrPausedCoveredSeconds());
        long tmsConsumedSeconds = Math.max(0,
                coveredSecondsBetween(ticket.getOpenedAt(), resolutionEnd, priority)
                        - ticket.getTmsPausedCoveredSeconds());

        long currentPauseSeconds = ticket.getSlaPausedAt() == null ? 0
                : coveredSecondsBetween(ticket.getSlaPausedAt(), now, priority);
        long currentTmrExtension = ticket.getResolvedAt() == null
                && ticket.getFirstResponseAt() == null
                && ticket.isTmrPauseEligible() ? currentPauseSeconds : 0;
        long currentTmsExtension = ticket.getResolvedAt() == null
                && ticket.isTmsPauseEligible() ? currentPauseSeconds : 0;

        Instant tmrDeadline = addCoveredTime(
                ticket.getOpenedAt(),
                priority.getFirstResponseTarget().plusSeconds(
                        ticket.getTmrPauseExtensionSeconds() + currentTmrExtension),
                priority);
        Instant tmsDeadline = addCoveredTime(
                ticket.getOpenedAt(),
                priority.getResolutionTarget().plusSeconds(
                        ticket.getTmsPauseExtensionSeconds() + currentTmsExtension),
                priority);

        return new SlaMetrics(
                priority,
                priority.getFirstResponseTarget().toMinutes(),
                priority.getResolutionTarget().toMinutes(),
                tmrDeadline,
                tmsDeadline,
                Duration.ofSeconds(tmrConsumedSeconds).toMinutes(),
                Duration.ofSeconds(tmsConsumedSeconds).toMinutes(),
                ticket.getFirstResponseAt() == null
                        ? now.isAfter(tmrDeadline)
                        : ticket.getFirstResponseAt().isAfter(tmrDeadline),
                ticket.getResolvedAt() == null
                        ? now.isAfter(tmsDeadline)
                        : ticket.getResolvedAt().isAfter(tmsDeadline),
                ticket.getFirstResponseAt() == null
                        && ticket.getResolvedAt() == null
                        && tmrConsumedSeconds * 100
                                >= priority.getFirstResponseTarget().toSeconds() * 80,
                ticket.getResolvedAt() == null
                        && tmsConsumedSeconds * 100
                                >= priority.getResolutionTarget().toSeconds() * 80);
    }

    private Instant addCoveredTime(Instant start, Duration target,//Calcula o prazo final do SLA,
                                   // considerando o horário de atendimento, os dias válidos e a prioridade.
                                   TicketPriority priority) {
        if (priority.hasContinuousCoverage()) {//cobertura continua
            return start.plus(target);
        }

        Duration remaining = target;
        Instant cursor = start;
        while (!remaining.isZero()) {//verifica quanto tempo de sla pode ser contabilizado e desconta do dia válido
            ZonedDateTime localCursor = cursor.atZone(zone);
            LocalDate date = localCursor.toLocalDate();
            if (!isCoveredDate(date, priority)) {
                cursor = nextDayAtCoverageStart(date);
                continue;
            }

            Instant windowStart = date.atTime(COVERAGE_START).atZone(zone).toInstant();//inicio expediente
            Instant windowEnd = date.atTime(COVERAGE_END).atZone(zone).toInstant();//fim expediente
            Instant coveredStart = cursor.isAfter(windowStart) ? cursor : windowStart;//pode ser contabilizado
            if (!coveredStart.isBefore(windowEnd)) {//horario começar o SLA já chegou ou passou das 18h
                cursor = nextDayAtCoverageStart(date);
                continue;
            }

            Duration available = Duration.between(coveredStart, windowEnd);//tempo disponivel
            if (remaining.compareTo(available) <= 0) {//tempo SLA é menor ou igual ao tempo disponivel hoje
                return coveredStart.plus(remaining);
            }

            remaining = remaining.minus(available);//subtrai o que falta
            cursor = nextDayAtCoverageStart(date);//prox dia
        }
        return cursor;
    }

    public long coveredSecondsBetween(Instant start, Instant end,//Calcula quantos segundos de SLA foram contabilizados
                                      // entre duas datas,
                                      // respeitando os horários de atendimento.
                                      TicketPriority priority) {
        if (!end.isAfter(start)) {
            return 0;
        }
        if (priority.hasContinuousCoverage()) {
            return Duration.between(start, end).getSeconds();
        }

        LocalDate date = start.atZone(zone).toLocalDate();
        LocalDate lastDate = end.atZone(zone).toLocalDate();
        Duration covered = Duration.ZERO;
        while (!date.isAfter(lastDate)) {
            if (isCoveredDate(date, priority)) {
                Instant windowStart = date.atTime(COVERAGE_START).atZone(zone).toInstant();
                Instant windowEnd = date.atTime(COVERAGE_END).atZone(zone).toInstant();
                Instant overlapStart = start.isAfter(windowStart) ? start : windowStart;
                Instant overlapEnd = end.isBefore(windowEnd) ? end : windowEnd;
                if (overlapEnd.isAfter(overlapStart)) {
                    covered = covered.plus(Duration.between(overlapStart, overlapEnd));
                }
            }
            date = date.plusDays(1);
        }
        return covered.getSeconds();
    }

    private boolean isCoveredDate(LocalDate date, TicketPriority priority) {//Verifica se o dia pode ser contabilizado no SLA,
        // considerando a prioridade e os feriados.
        if (holidays.contains(date)) {
            return false;
        }
        return switch (priority) {
            case P2, P3 -> date.getDayOfWeek().getValue() <= 6;
            case P4 -> date.getDayOfWeek().getValue() <= 5;
            case P1 -> true;
        };
    }

    private Instant nextDayAtCoverageStart(LocalDate date) {//Retorna o próximo dia às 8h, início do expediente.
        return date.plusDays(1).atTime(COVERAGE_START).atZone(zone).toInstant();
    }

    public record SlaMetrics(//Reúne as informações calculadas do SLA em um único objeto.
            TicketPriority priority,
            long tmrTargetMinutes,
            long tmsTargetMinutes,
            Instant tmrDeadlineAt,
            Instant tmsDeadlineAt,
            long tmrConsumedMinutes,
            long tmsConsumedMinutes,
            boolean tmrBreached,
            boolean tmsBreached,
            boolean tmrWarningDue,
            boolean tmsWarningDue) {
    }
}
