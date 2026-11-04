package com.nvs.ams.services;

import java.time.Year;
import java.time.Instant;
import java.time.Clock;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.nvs.ams.domain.models.Category;
import com.nvs.ams.domain.models.Device;
import com.nvs.ams.domain.models.Location;
import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.TicketEvent;
import com.nvs.ams.domain.models.User;
import com.nvs.ams.domain.models.enums.EventType;
import com.nvs.ams.domain.models.enums.TicketPriority;
import com.nvs.ams.domain.models.enums.TicketStatus;
import com.nvs.ams.domain.models.enums.UserRole;
import com.nvs.ams.infra.repositories.CategoryRepository;
import com.nvs.ams.infra.repositories.DeviceRepository;
import com.nvs.ams.infra.repositories.TicketEventRepository;
import com.nvs.ams.infra.repositories.TicketRepository;
import com.nvs.ams.infra.repositories.UserRepository;
import com.nvs.ams.presentation.dto.request.CreateTicketRequest;
import com.nvs.ams.presentation.dto.request.ChangeTicketStatusRequest;
import com.nvs.ams.presentation.dto.request.SetTicketPriorityRequest;
import com.nvs.ams.presentation.dto.request.TicketResponseRequest;
import com.nvs.ams.presentation.dto.response.TicketResponse;
import com.nvs.ams.presentation.dto.response.TicketEventResponse;
import com.nvs.ams.presentation.exception.ApiException;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class TicketService {

    private final TicketRepository tickets;
    private final TicketEventRepository events;
    private final UserRepository users;
    private final CategoryRepository categories;
    private final DeviceRepository devices;
    private final SlaService slaService;
    private final Clock clock;

    @Transactional 
    public TicketResponse create(Long userId, Long deviceId, CreateTicketRequest req) {

        User requester = users.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));

        Location location = requester.getLocation();
        if (location == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Usuário sem loja/CD associada");
        }

        Category category = categories.findById(req.categoryId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST, "Categoria inválida"));

        Device device = null;
        if (deviceId != null) {
            device = devices.findById(deviceId)
                    .orElseThrow(() -> new ApiException(
                            HttpStatus.BAD_REQUEST, "Dispositivo inválido"));
            if (!device.getLocation().getId().equals(location.getId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "O dispositivo não pertence à loja/CD do usuário");
            }
        }

        Ticket ticket = new Ticket();
        ticket.setProtocol(generateProtocol());
        ticket.setDescription(req.description().trim());
        ticket.setOpenedAt(clock.instant());
        ticket.setCategory(category);
        ticket.setRequester(requester);
        ticket.setLocation(location);
        ticket.setDevice(device);
        tickets.save(ticket);

        events.save(new TicketEvent(ticket, EventType.CREATED, requester,
                Map.of("channel", "PORTAL")));

        return toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> list(Long userId) {
        User user = findUser(userId);
        List<Ticket> result = (user.getRole() == UserRole.REQUESTER)
                ? tickets.findByRequesterIdOrderByOpenedAtDesc(user.getId())
                : tickets.findAllByOrderByOpenedAtDesc();
        return result.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TicketResponse get(Long userId, Long ticketId) {
        User user = findUser(userId);
        Ticket ticket = tickets.findById(ticketId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Chamado não encontrado"));

        if (user.getRole() == UserRole.REQUESTER
                && !ticket.getRequester().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public List<TicketEventResponse> listEvents(Long userId, Long ticketId) {
        User user = findUser(userId);
        Ticket ticket = findTicket(ticketId);
        if (user.getRole() == UserRole.REQUESTER
                && !ticket.getRequester().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return events.findByTicket_IdOrderByCreatedAtAsc(ticketId)
                .stream().map(TicketEventResponse::from).toList();
    }

    @Transactional
    public TicketResponse setPriority(Long userId, Long ticketId,
                                      SetTicketPriorityRequest request) {
        User user = findUser(userId);
        if (!canClassify(user.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Somente a equipe de suporte pode classificar chamados");
        }

        Ticket ticket = findTicket(ticketId);
        TicketPriority previousPriority = ticket.getPriority();
        ticket.setPriority(request.priority());
        events.save(new TicketEvent(ticket, EventType.CLASSIFIED, user,
                Map.of(
                        "previousPriority", previousPriority == null
                                ? "UNCLASSIFIED" : previousPriority.name(),
                        "priority", request.priority().name())));
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse recordResponse(Long userId, Long ticketId,
                                         TicketResponseRequest request) {
        User user = findUser(userId);
        requireSupportUser(user);
        Ticket ticket = findTicket(ticketId);
        if (ticket.getResolvedAt() != null) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "O chamado já foi resolvido");
        }

        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(clock.instant());
        }
        events.save(new TicketEvent(ticket, EventType.COMMENTED, user,
                Map.of("message", request.message().trim())));
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse resolve(Long userId, Long ticketId) {
        User user = findUser(userId);
        requireSupportUser(user);
        Ticket ticket = findTicket(ticketId);
        if (ticket.getResolvedAt() != null) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "O chamado já foi resolvido");
        }

        Instant now = clock.instant();
        finishPauseIfNeeded(ticket, user, now);
        ticket.setResolvedAt(now);
        ticket.setStatus(TicketStatus.RESOLVED);
        events.save(new TicketEvent(ticket, EventType.STATUS_CHANGED, user,
                Map.of("status", TicketStatus.RESOLVED.name())));
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse changeStatus(Long userId, Long ticketId,
                                       ChangeTicketStatusRequest request) {
        User user = findUser(userId);
        requireSupportUser(user);
        Ticket ticket = findTicket(ticketId);
        TicketStatus previous = ticket.getStatus();
        TicketStatus next = request.status();

        if (previous == TicketStatus.CLOSED || previous == TicketStatus.CANCELLED
                || previous == TicketStatus.RESOLVED) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Não é possível alterar o status de um chamado encerrado ou resolvido");
        }
        if (next == TicketStatus.RESOLVED || next == TicketStatus.CLOSED
                || next == TicketStatus.CANCELLED) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Use o endpoint específico para resolver o chamado; fechamento é automático");
        }

        Instant now = clock.instant();
        boolean wasWaiting = isWaitingStatus(previous);
        boolean willWait = isWaitingStatus(next);

        if (!wasWaiting && willWait) {
            ticket.setSlaPausedAt(now);
            events.save(new TicketEvent(ticket, EventType.SLA_PAUSED, user,
                    Map.of("status", next.name(), "pausedAt", now.toString())));
        } else if (wasWaiting && !willWait) {
            finishPauseIfNeeded(ticket, user, now);
        }

        ticket.setStatus(next);
        events.save(new TicketEvent(ticket, EventType.STATUS_CHANGED, user,
                Map.of("previousStatus", previous.name(), "status", next.name())));
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse recordRequesterResponse(Long userId, Long ticketId,
                                                   TicketResponseRequest request) {
        User user = findUser(userId);
        if (user.getRole() != UserRole.REQUESTER) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Este endpoint é exclusivo para o solicitante");
        }

        Ticket ticket = findTicket(ticketId);
        if (!ticket.getRequester().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Você só pode responder aos seus próprios chamados");
        }
        if (ticket.getStatus() == TicketStatus.CLOSED
                || ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "O chamado já foi encerrado e não aceita respostas");
        }

        Instant now = clock.instant();
        ticket.setRequesterLastResponseAt(now);
        events.save(new TicketEvent(ticket, EventType.REQUESTER_RESPONDED, user,
                Map.of("message", request.message().trim())));

        if (ticket.getStatus() == TicketStatus.RESOLVED) {
            ticket.setStatus(TicketStatus.REOPENED);
            ticket.setResolvedAt(null);
            events.save(new TicketEvent(ticket, EventType.STATUS_CHANGED, user,
                    Map.of("previousStatus", TicketStatus.RESOLVED.name(),
                            "status", TicketStatus.REOPENED.name(),
                            "reason", "REQUESTER_REPLIED")));
        } else if (ticket.getStatus() == TicketStatus.WAITING_REQUESTER) {
            finishPauseIfNeeded(ticket, user, now);
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            events.save(new TicketEvent(ticket, EventType.STATUS_CHANGED, user,
                    Map.of("previousStatus", TicketStatus.WAITING_REQUESTER.name(),
                            "status", TicketStatus.IN_PROGRESS.name(),
                            "reason", "REQUESTER_REPLIED")));
        }
        return toResponse(ticket);
    }

    private boolean isWaitingStatus(TicketStatus status) {
        return status == TicketStatus.WAITING_REQUESTER
                || status == TicketStatus.WAITING_THIRD_PARTY;
    }

    private void finishPauseIfNeeded(Ticket ticket, User actor, Instant resumedAt) {
        Instant pausedAt = ticket.getSlaPausedAt();
        if (pausedAt == null) {
            return;
        }

        long pauseSeconds = slaService.coveredSecondsBetween(
                pausedAt, resumedAt, ticket.getPriority());
        ticket.setSlaPausedSeconds(ticket.getSlaPausedSeconds() + pauseSeconds);
        if (ticket.getFirstResponseAt() == null) {
            ticket.setSlaPausedBeforeFirstResponseSeconds(
                    ticket.getSlaPausedBeforeFirstResponseSeconds() + pauseSeconds);
        }
        ticket.setSlaPausedAt(null);
        events.save(new TicketEvent(ticket, EventType.SLA_RESUMED, actor,
                Map.of("pausedAt", pausedAt.toString(),
                        "resumedAt", resumedAt.toString(),
                        "pausedSeconds", pauseSeconds)));
    }

    private User findUser(Long userId) {
        return users.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));
    }

    private Ticket findTicket(Long ticketId) {
        return tickets.findById(ticketId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Chamado não encontrado"));
    }

    private TicketResponse toResponse(Ticket ticket) {
        return TicketResponse.from(ticket, slaService);
    }

    private void requireSupportUser(User user) {
        if (user.getRole() == UserRole.REQUESTER) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Somente a equipe de suporte pode atender chamados");
        }
    }

    private boolean canClassify(UserRole role) {
        return role == UserRole.TRIAGE_AGENT
                || role == UserRole.SPECIALIST
                || role == UserRole.LEADER;
    }

    private String generateProtocol() {
        return String.format("NX-%d-%06d",
                Year.now().getValue(), tickets.nextProtocolNumber());
    }
}