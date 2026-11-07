package com.nvs.ams.services;

import java.time.Year;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.nvs.ams.domain.models.Category;
import com.nvs.ams.domain.models.Device;
import com.nvs.ams.domain.models.Location;
import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.TicketEvent;
import com.nvs.ams.domain.models.Team;
import com.nvs.ams.domain.models.User;
import com.nvs.ams.domain.models.enums.EventType;
import com.nvs.ams.domain.models.enums.TicketPriority;
import com.nvs.ams.domain.models.enums.TicketStatus;
import com.nvs.ams.domain.models.enums.UserRole;
import com.nvs.ams.infra.repositories.CategoryRepository;
import com.nvs.ams.infra.repositories.DeviceRepository;
import com.nvs.ams.infra.repositories.TicketEventRepository;
import com.nvs.ams.infra.repositories.TicketRepository;
import com.nvs.ams.infra.repositories.TeamRepository;
import com.nvs.ams.infra.repositories.UserRepository;
import com.nvs.ams.presentation.dto.request.AssignTicketRequest;
import com.nvs.ams.presentation.dto.request.ChangeTicketStatusRequest;
import com.nvs.ams.presentation.dto.request.CreateTicketRequest;
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
    private final TeamRepository teams;
    private final TicketEventRepository events;
    private final UserRepository users;
    private final CategoryRepository categories;
    private final DeviceRepository devices;
    private final SlaService slaService;
    private final Clock clock;

    @Transactional 
    public TicketResponse create(Long userId, Long deviceId, CreateTicketRequest req) {//Cria um chamado, valida os dados, gera o
        // protocolo e registra o evento de criação.

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
    public List<TicketResponse> list(Long userId) {//Lista os chamados. Solicitantes veem apenas os próprios;
        // os demais perfis veem todos.
        User user = findUser(userId);
        List<Ticket> result = (user.getRole() == UserRole.REQUESTER)
                ? tickets.findByRequesterIdOrderByOpenedAtDesc(user.getId())//Se for solicitante, lista apenas os chamados
                // que ele abriu, do mais recente para o mais antigo.
                : tickets.findAllByOrderByOpenedAtDesc();//Se for outro perfil, lista todos os chamados,
        // também do mais recente para o mais antigo.
        return result.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TicketResponse get(Long userId, Long ticketId) {//Busca um chamado específico e verifica se o usuário tem
        // permissão para acessá-lo.
        User user = findUser(userId);
        Ticket ticket = tickets.findById(ticketId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Chamado não encontrado"));

        if (user.getRole() == UserRole.REQUESTER
                && !ticket.getRequester().getId().equals(user.getId())) {//sou o usuário autorizado?
            throw new ApiException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public List<TicketEventResponse> getEvents(Long userId, Long ticketId) {//Retorna o histórico de eventos do chamado
        // em ordem cronológica.
        User user = findUser(userId);
        Ticket ticket = findTicket(ticketId);
        if (user.getRole() == UserRole.REQUESTER
                && !ticket.getRequester().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return events.findByTicketIdOrderByCreatedAtAsc(ticketId)//Busca todos os eventos daquele chamado, ordenados pela data de criação
                .stream().map(TicketEventResponse::from).toList();
    }

    @Transactional
    public TicketResponse setPriority(Long userId, Long ticketId,//Define a prioridade do chamado, reinicia os alertas do SLA
                                      // e registra a classificação.
                                      SetTicketPriorityRequest request) {
        User user = findUser(userId);
        if (!canClassify(user.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Somente a equipe de suporte pode classificar chamados");
        }

        Ticket ticket = findTicket(ticketId);//busca o chamado
        TicketPriority previousPriority = ticket.getPriority();//guarda a prioridade anterior
        ticket.setPriority(request.priority());//define uma nova
        ticket.setTmrAlertSent(false);//reinicia os alertas de SLA
        ticket.setTmsAlertSent(false);
        if (ticket.getSlaPausedAt() != null) {//verifica se o SLA está pausado
            SlaService.SlaMetrics metrics = slaService.snapshot(ticket);//Se estiver pausado, calcula as métricas do SLA
            // e verifica se os relógios de TMR e TMS ainda podem ter a pausa contabilizada como extensão do prazo.
            ticket.setTmrPauseEligible(ticket.getFirstResponseAt() == null
                    && metrics != null && !metrics.tmrBreached());
            ticket.setTmsPauseEligible(ticket.getResolvedAt() == null
                    && metrics != null && !metrics.tmsBreached());
        }
        events.save(new TicketEvent(ticket, EventType.CLASSIFIED, user,
                Map.of(
                        "previousPriority", previousPriority == null
                                ? "UNCLASSIFIED" : previousPriority.name(),
                        "priority", request.priority().name())));
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse recordResponse(Long userId, Long ticketId,//Registra uma mensagem no chamado.
                                         // Também pode registrar a primeira resposta da equipe, retomar o SLA ou reabrir
                                         // o chamado, conforme a situação.
                                         TicketResponseRequest request) {
        User user = findUser(userId);
        Ticket ticket = findTicket(ticketId);
        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Não é possível responder a um chamado cancelado");
        }
        boolean requesterResponse = user.getRole() == UserRole.REQUESTER;
        if (requesterResponse) {
            if (!ticket.getRequester().getId().equals(user.getId())) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Acesso negado");
            }
            if (ticket.getStatus() == TicketStatus.RESOLVED
                    || ticket.getStatus() == TicketStatus.CLOSED) {
                reopenTicket(ticket, user);//reabre o chamado
            } else if (ticket.getStatus() == TicketStatus.WAITING_REQUESTER) {
                resumeSlaClock(ticket);//Se estiver aguardando o solicitante, retoma o SLA, muda o status para IN_PROGRESS
                // e registra a alteração.
                ticket.setStatus(TicketStatus.IN_PROGRESS);
                recordStatus(ticket, user, TicketStatus.IN_PROGRESS);
            }
        } else {
            requireSupportUser(user);
        }
        if (!requesterResponse && ticket.getResolvedAt() != null) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "O chamado já foi resolvido");
        }

        if (!requesterResponse && ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(clock.instant());
        }//Se for a primeira resposta da equipe, salva a data e a hora para calcular o TMR.
        if (!requesterResponse//Retoma o SLA e atualiza o status
                && (ticket.getStatus() == TicketStatus.WAITING_REQUESTER
                || ticket.getStatus() == TicketStatus.WAITING_THIRD_PARTY)) {//resposta de terceiros
            resumeSlaClock(ticket);
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            recordStatus(ticket, user, TicketStatus.IN_PROGRESS);
        }
        events.save(new TicketEvent(ticket, EventType.COMMENTED, user,
                Map.of("message", request.message().trim())));
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse resolve(Long userId, Long ticketId) {//Resolve o chamado, registra a data da resolução e pausa o SLA.
        User user = findUser(userId);
        requireSupportUser(user);
        Ticket ticket = findTicket(ticketId);
        if (ticket.getResolvedAt() != null) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "O chamado já foi resolvido");
        }

        if (ticket.getSlaPausedAt() != null) {
            resumeSlaClock(ticket);
        }
        pauseSlaClock(ticket);
        ticket.setResolvedAt(clock.instant());
        ticket.setStatus(TicketStatus.RESOLVED);
        recordStatus(ticket, user, TicketStatus.RESOLVED);
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse changeStatus(Long userId, Long ticketId,//Altera o status do chamado e pausa ou retoma
                                       // o SLA conforme o novo status.
                                       ChangeTicketStatusRequest request) {
        User user = findUser(userId);
        requireSupportUser(user);
        Ticket ticket = findTicket(ticketId);
        TicketStatus nextStatus = request.status();
        if (!isOperationalStatus(nextStatus)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Chamados resolvidos ou fechados devem ser reabertos antes de terem o status alterado");
        }
        if (ticket.getStatus() == TicketStatus.RESOLVED
                || ticket.getStatus() == TicketStatus.CLOSED
                || ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Não é possível alterar diretamente o status de um chamado encerrado.");
        }
        if (isPausedStatus(nextStatus)) {
            pauseSlaClock(ticket);
        } else {
            resumeSlaClock(ticket);
        }
        ticket.setStatus(nextStatus);
        recordStatus(ticket, user, nextStatus);
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse reopen(Long userId, Long ticketId) {//Reabre um chamado resolvido ou fechado.
        User user = findUser(userId);
        Ticket ticket = findTicket(ticketId);
        if (user.getRole() == UserRole.REQUESTER
                && !ticket.getRequester().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        if (ticket.getStatus() != TicketStatus.RESOLVED
                && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Somente chamados resolvidos ou fechados podem ser reabertos");
        }
        if (user.getRole() != UserRole.REQUESTER) {
            requireSupportUser(user);
        }
        reopenTicket(ticket, user);
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse assignTeam(Long userId, Long ticketId,//Atribui o chamado a uma equipe e registra essa ação no histórico.
                                     AssignTicketRequest request) {
        User user = findUser(userId);
        requireSupportUser(user);
        Ticket ticket = findTicket(ticketId);
        Team team = teams.findById(request.teamId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST, "Equipe inválida"));
        ticket.setAssignedTeam(team);
        events.save(new TicketEvent(ticket, EventType.ASSIGNED, user,
                Map.of("teamId", team.getId(), "team", team.getName())));
        return toResponse(ticket);
    }

    private User findUser(Long userId) {//Busca um usuário pelo ID. Retorna erro se ele não existir.
        return users.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));
    }

    private Ticket findTicket(Long ticketId) {//Busca um chamado pelo ID. Retorna erro se ele não existir.
        return tickets.findById(ticketId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Chamado não encontrado"));
    }

    private TicketResponse toResponse(Ticket ticket) {
        return TicketResponse.from(ticket, slaService);
    }//Converte o chamado em uma resposta para a API, incluindo as métricas do SLA.

    private void reopenTicket(Ticket ticket, User actor) {//Executa a lógica interna de reabertura,
        // limpa a data de resolução e registra o evento.
        Instant previousResolvedAt = ticket.getResolvedAt();
        resumeSlaClock(ticket);
        ticket.setResolvedAt(null);
        ticket.setStatus(TicketStatus.REOPENED);
        ticket.setTmsAlertSent(false);
        events.save(new TicketEvent(ticket, EventType.STATUS_CHANGED, actor,
                Map.of("status", TicketStatus.REOPENED.name(),
                        "previousResolvedAt", previousResolvedAt.toString())));
    }

    private void pauseSlaClock(Ticket ticket) {//Pausa a contagem do SLA e registra o momento da pausa.
        if (ticket.getSlaPausedAt() != null) {
            return;
        }
        SlaService.SlaMetrics metrics = slaService.snapshot(ticket);
        ticket.setTmrClockPaused(ticket.getFirstResponseAt() == null);
        ticket.setTmsClockPaused(ticket.getResolvedAt() == null);
        ticket.setTmrPauseEligible(metrics != null && !metrics.tmrBreached()
                && ticket.getFirstResponseAt() == null);
        ticket.setTmsPauseEligible(metrics != null && !metrics.tmsBreached()
                && ticket.getResolvedAt() == null);
        ticket.setSlaPausedAt(clock.instant());
    }

    private void resumeSlaClock(Ticket ticket) {//Retoma a contagem do SLA e contabiliza o tempo da pausa.
        Instant pausedAt = ticket.getSlaPausedAt();
        if (pausedAt == null) {
            return;
        }
        long pausedSeconds = ticket.getPriority() == null ? 0
                : slaService.coveredSecondsBetween(pausedAt, clock.instant(),
                        ticket.getPriority());
        if (ticket.isTmrClockPaused()) {
            ticket.setTmrPausedCoveredSeconds(
                    ticket.getTmrPausedCoveredSeconds() + pausedSeconds);
        }
        if (ticket.isTmsClockPaused()) {
            ticket.setTmsPausedCoveredSeconds(
                    ticket.getTmsPausedCoveredSeconds() + pausedSeconds);
        }
        if (ticket.isTmrPauseEligible()) {
            ticket.setTmrPauseExtensionSeconds(
                    ticket.getTmrPauseExtensionSeconds() + pausedSeconds);
        }
        if (ticket.isTmsPauseEligible()) {
            ticket.setTmsPauseExtensionSeconds(
                    ticket.getTmsPauseExtensionSeconds() + pausedSeconds);
        }
        ticket.setSlaPausedAt(null);
        ticket.setTmrClockPaused(false);
        ticket.setTmsClockPaused(false);
        ticket.setTmrPauseEligible(false);
        ticket.setTmsPauseEligible(false);
    }

    private void recordStatus(Ticket ticket, User actor, TicketStatus status) {//Registra no histórico a alteração de status
        // do chamado.
        events.save(new TicketEvent(ticket, EventType.STATUS_CHANGED, actor,
                Map.of("status", status.name())));
    }

    private boolean isPausedStatus(TicketStatus status) {//Verifica se um status exige pausar o SLA.
        return status == TicketStatus.WAITING_REQUESTER
                || status == TicketStatus.WAITING_THIRD_PARTY
                || status == TicketStatus.RESOLVED
                || status == TicketStatus.CLOSED
                || status == TicketStatus.CANCELLED;
    }

    private boolean isOperationalStatus(TicketStatus status) {//Verifica se um status pode ser definido pela
        // alteração comum de status.
        return status == TicketStatus.OPEN
                || status == TicketStatus.IN_TRIAGE
                || status == TicketStatus.IN_PROGRESS
                || status == TicketStatus.REOPENED
                || status == TicketStatus.WAITING_REQUESTER
                || status == TicketStatus.WAITING_THIRD_PARTY;
    }

    private void requireSupportUser(User user) {//Impede que usuários solicitantes executem ações exclusivas da equipe
        // de suporte.
        if (user.getRole() == UserRole.REQUESTER) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Somente a equipe de suporte pode atender chamados");
        }
    }

    private boolean canClassify(UserRole role) {//Verifica se o perfil pode classificar chamados:
        // agente de triagem, especialista ou líder.
        return role == UserRole.TRIAGE_AGENT
                || role == UserRole.SPECIALIST
                || role == UserRole.LEADER;
    }

    private String generateProtocol() {//Gera o protocolo do chamado com o ano atual e um número sequencial.
        return String.format("NX-%d-%06d",
                Year.now().getValue(), tickets.nextProtocolNumber());
    }
}