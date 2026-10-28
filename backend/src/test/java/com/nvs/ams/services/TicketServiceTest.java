package com.nvs.ams.services;

import com.nvs.ams.domain.models.*;
import com.nvs.ams.domain.models.enums.EventType;
import com.nvs.ams.domain.models.enums.LocationType;
import com.nvs.ams.domain.models.enums.TicketPriority;
import com.nvs.ams.domain.models.enums.TicketStatus;
import com.nvs.ams.domain.models.enums.UserRole;
import com.nvs.ams.infra.repositories.*;
import com.nvs.ams.presentation.dto.request.CreateTicketRequest;
import com.nvs.ams.presentation.dto.request.SetTicketPriorityRequest;
import com.nvs.ams.presentation.dto.request.TicketResponseRequest;
import com.nvs.ams.presentation.dto.response.TicketResponse;
import com.nvs.ams.presentation.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketEventRepository ticketEventRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private SlaService slaService;

    @Mock
    private Clock clock;

    @InjectMocks
    private TicketService ticketService;

    private User requester;
    private User supportAgent;
    private Location location;
    private Category category;
    private final Instant now = Instant.parse("2026-10-28T10:00:00Z");

    @BeforeEach
    void setUp() {
        lenient().when(clock.instant()).thenReturn(now);

        location = new Location();
        location.setId(1L);
        location.setCode("LJ-001");
        location.setName("Loja Boa Viagem");
        location.setType(LocationType.STORE);

        requester = new User();
        requester.setId(10L);
        requester.setName("Maria Solicitante");
        requester.setEmail("maria@nexo.com");
        requester.setRole(UserRole.REQUESTER);
        requester.setLocation(location);

        supportAgent = new User();
        supportAgent.setId(20L);
        supportAgent.setName("Carlos Suporte");
        supportAgent.setEmail("carlos@nexo.com");
        supportAgent.setRole(UserRole.TRIAGE_AGENT);
        supportAgent.setLocation(location);

        category = new Category();
        category.setId(100L);
        category.setName("PDV");
    }

    @Test
    @DisplayName("Deve criar chamado com sucesso e gerar protocolo e evento de criação")
    void shouldCreateTicketSuccessfully() {
        CreateTicketRequest request = new CreateTicketRequest("PDV travando na tela de pagamento", 100L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(requester));
        when(categoryRepository.findById(100L)).thenReturn(Optional.of(category));
        when(ticketRepository.nextProtocolNumber()).thenReturn(42L);

        TicketResponse response = ticketService.create(10L, null, request);

        assertNotNull(response);
        assertEquals("PDV travando na tela de pagamento", response.description());
        assertEquals("PDV", response.category());
        assertEquals("Loja Boa Viagem", response.location());
        assertTrue(response.protocol().matches("NX-\\d{4}-000042"));

        ArgumentCaptor<Ticket> ticketCaptor = ArgumentCaptor.forClass(Ticket.class);
        verify(ticketRepository).save(ticketCaptor.capture());
        Ticket savedTicket = ticketCaptor.getValue();
        assertEquals(TicketStatus.OPEN, savedTicket.getStatus());
        assertEquals(requester, savedTicket.getRequester());
        assertEquals(now, savedTicket.getOpenedAt());

        ArgumentCaptor<TicketEvent> eventCaptor = ArgumentCaptor.forClass(TicketEvent.class);
        verify(ticketEventRepository).save(eventCaptor.capture());
        TicketEvent savedEvent = eventCaptor.getValue();
        assertEquals(EventType.CREATED, savedEvent.getType());
        assertEquals(requester, savedEvent.getActor());
    }

    @Test
    @DisplayName("Deve falhar ao criar chamado se usuário não for encontrado (401)")
    void shouldFailWhenUserNotFound() {
        CreateTicketRequest request = new CreateTicketRequest("PDV travando na tela de pagamento", 100L);
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> ticketService.create(99L, null, request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        assertEquals("Usuário não encontrado", ex.getMessage());
    }

    @Test
    @DisplayName("Deve falhar ao criar chamado se usuário não tiver loja/CD associada (400)")
    void shouldFailWhenUserHasNoLocation() {
        requester.setLocation(null);
        CreateTicketRequest request = new CreateTicketRequest("PDV travando na tela de pagamento", 100L);
        when(userRepository.findById(10L)).thenReturn(Optional.of(requester));

        ApiException ex = assertThrows(ApiException.class, () -> ticketService.create(10L, null, request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("Usuário sem loja/CD associada", ex.getMessage());
    }

    @Test
    @DisplayName("Deve falhar ao criar chamado se categoria for inválida (400)")
    void shouldFailWhenCategoryNotFound() {
        CreateTicketRequest request = new CreateTicketRequest("PDV travando na tela de pagamento", 999L);
        when(userRepository.findById(10L)).thenReturn(Optional.of(requester));
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> ticketService.create(10L, null, request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("Categoria inválida", ex.getMessage());
    }

    @Test
    @DisplayName("Deve falhar ao criar chamado se dispositivo pertencer a outra loja/CD (400)")
    void shouldFailWhenDeviceBelongsToAnotherLocation() {
        Location otherLocation = new Location();
        otherLocation.setId(2L);
        otherLocation.setCode("LJ-002");

        Device device = new Device();
        device.setId(50L);
        device.setLocation(otherLocation);

        CreateTicketRequest request = new CreateTicketRequest("PDV travando na tela de pagamento", 100L);
        when(userRepository.findById(10L)).thenReturn(Optional.of(requester));
        when(categoryRepository.findById(100L)).thenReturn(Optional.of(category));
        when(deviceRepository.findById(50L)).thenReturn(Optional.of(device));

        ApiException ex = assertThrows(ApiException.class, () -> ticketService.create(10L, 50L, request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("O dispositivo não pertence à loja/CD do usuário", ex.getMessage());
    }

    @Test
    @DisplayName("Deve listar apenas os próprios chamados quando o usuário for REQUESTER")
    void shouldListOnlyOwnTicketsWhenUserIsRequester() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);
        ticket.setProtocol("NX-2026-000001");
        ticket.setDescription("Problema de rede");
        ticket.setCategory(category);
        ticket.setLocation(location);
        ticket.setRequester(requester);
        ticket.setStatus(TicketStatus.OPEN);

        when(userRepository.findById(10L)).thenReturn(Optional.of(requester));
        when(ticketRepository.findByRequesterIdOrderByOpenedAtDesc(10L)).thenReturn(List.of(ticket));

        List<TicketResponse> list = ticketService.list(10L);

        assertEquals(1, list.size());
        assertEquals("NX-2026-000001", list.get(0).protocol());
        verify(ticketRepository).findByRequesterIdOrderByOpenedAtDesc(10L);
        verify(ticketRepository, never()).findAllByOrderByOpenedAtDesc();
    }

    @Test
    @DisplayName("Deve listar todos os chamados quando o usuário for atendente ou líder")
    void shouldListAllTicketsWhenUserIsNotRequester() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);
        ticket.setProtocol("NX-2026-000001");
        ticket.setDescription("Problema de rede");
        ticket.setCategory(category);
        ticket.setLocation(location);
        ticket.setRequester(requester);
        ticket.setStatus(TicketStatus.OPEN);

        when(userRepository.findById(20L)).thenReturn(Optional.of(supportAgent));
        when(ticketRepository.findAllByOrderByOpenedAtDesc()).thenReturn(List.of(ticket));

        List<TicketResponse> list = ticketService.list(20L);

        assertEquals(1, list.size());
        verify(ticketRepository).findAllByOrderByOpenedAtDesc();
        verify(ticketRepository, never()).findByRequesterIdOrderByOpenedAtDesc(any());
    }

    @Test
    @DisplayName("Deve negar acesso ao buscar chamado de outro solicitante (403 FORBIDDEN)")
    void shouldDenyAccessWhenRequesterViewsAnotherUsersTicket() {
        User otherUser = new User();
        otherUser.setId(99L);

        Ticket ticket = new Ticket();
        ticket.setId(1L);
        ticket.setRequester(otherUser);

        when(userRepository.findById(10L)).thenReturn(Optional.of(requester));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        ApiException ex = assertThrows(ApiException.class, () -> ticketService.get(10L, 1L));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertEquals("Acesso negado", ex.getMessage());
    }

    @Test
    @DisplayName("Deve retornar 404 NOT_FOUND se o chamado não existir")
    void shouldReturn404WhenTicketNotFound() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(requester));
        when(ticketRepository.findById(999L)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> ticketService.get(10L, 999L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        assertEquals("Chamado não encontrado", ex.getMessage());
    }

    @Test
    @DisplayName("Deve criar chamado com dispositivo válido associado da mesma loja")
    void shouldCreateTicketWithValidDeviceSuccessfully() {
        Device device = new Device();
        device.setId(50L);
        device.setLocation(location);

        CreateTicketRequest request = new CreateTicketRequest("Impressora de etiquetas travada", 100L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(requester));
        when(categoryRepository.findById(100L)).thenReturn(Optional.of(category));
        when(deviceRepository.findById(50L)).thenReturn(Optional.of(device));
        when(ticketRepository.nextProtocolNumber()).thenReturn(55L);

        TicketResponse response = ticketService.create(10L, 50L, request);

        assertNotNull(response);
        ArgumentCaptor<Ticket> ticketCaptor = ArgumentCaptor.forClass(Ticket.class);
        verify(ticketRepository).save(ticketCaptor.capture());
        Ticket savedTicket = ticketCaptor.getValue();
        assertEquals(device, savedTicket.getDevice());
    }

    @Test
    @DisplayName("Deve remover espaços extras da descrição ao criar chamado (trim)")
    void shouldTrimDescriptionWhenCreatingTicket() {
        CreateTicketRequest request = new CreateTicketRequest("   Descrição com espaços nas pontas   ", 100L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(requester));
        when(categoryRepository.findById(100L)).thenReturn(Optional.of(category));
        when(ticketRepository.nextProtocolNumber()).thenReturn(1L);

        ticketService.create(10L, null, request);

        ArgumentCaptor<Ticket> ticketCaptor = ArgumentCaptor.forClass(Ticket.class);
        verify(ticketRepository).save(ticketCaptor.capture());
        assertEquals("Descrição com espaços nas pontas", ticketCaptor.getValue().getDescription());
    }

    @Test
    @DisplayName("Deve definir prioridade com sucesso por agente de triagem")
    void shouldSetPrioritySuccessfully() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);
        ticket.setCategory(category);
        ticket.setLocation(location);
        ticket.setStatus(TicketStatus.OPEN);

        when(userRepository.findById(20L)).thenReturn(Optional.of(supportAgent));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        SetTicketPriorityRequest req = new SetTicketPriorityRequest(TicketPriority.P1);
        TicketResponse response = ticketService.setPriority(20L, 1L, req);

        assertNotNull(response);
        assertEquals(TicketPriority.P1, ticket.getPriority());

        ArgumentCaptor<TicketEvent> eventCaptor = ArgumentCaptor.forClass(TicketEvent.class);
        verify(ticketEventRepository).save(eventCaptor.capture());
        assertEquals(EventType.CLASSIFIED, eventCaptor.getValue().getType());
        assertEquals("P1", eventCaptor.getValue().getPayload().get("priority"));
    }

    @Test
    @DisplayName("Deve negar definição de prioridade quando usuário for REQUESTER (403)")
    void shouldDenySetPriorityForRequester() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(requester));

        SetTicketPriorityRequest req = new SetTicketPriorityRequest(TicketPriority.P2);
        ApiException ex = assertThrows(ApiException.class, () -> ticketService.setPriority(10L, 1L, req));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertEquals("Somente a equipe de suporte pode classificar chamados", ex.getMessage());
    }

    @Test
    @DisplayName("Deve registrar resposta técnica e atualizar firstResponseAt se ainda não preenchido")
    void shouldRecordResponseSuccessfully() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);
        ticket.setCategory(category);
        ticket.setLocation(location);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setFirstResponseAt(null);

        when(userRepository.findById(20L)).thenReturn(Optional.of(supportAgent));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        TicketResponseRequest req = new TicketResponseRequest("Verificando conectividade do terminal");
        TicketResponse response = ticketService.recordResponse(20L, 1L, req);

        assertNotNull(response);
        assertEquals(now, ticket.getFirstResponseAt());

        ArgumentCaptor<TicketEvent> eventCaptor = ArgumentCaptor.forClass(TicketEvent.class);
        verify(ticketEventRepository).save(eventCaptor.capture());
        assertEquals(EventType.COMMENTED, eventCaptor.getValue().getType());
        assertEquals("Verificando conectividade do terminal", eventCaptor.getValue().getPayload().get("message"));
    }

    @Test
    @DisplayName("Deve falhar ao registrar resposta se chamado já estiver resolvido (409)")
    void shouldFailToRecordResponseWhenAlreadyResolved() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);
        ticket.setResolvedAt(now);

        when(userRepository.findById(20L)).thenReturn(Optional.of(supportAgent));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        TicketResponseRequest req = new TicketResponseRequest("Nova mensagem");
        ApiException ex = assertThrows(ApiException.class, () -> ticketService.recordResponse(20L, 1L, req));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("O chamado já foi resolvido", ex.getMessage());
    }

    @Test
    @DisplayName("Deve resolver chamado com sucesso e atualizar status e resolvedAt")
    void shouldResolveTicketSuccessfully() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);
        ticket.setCategory(category);
        ticket.setLocation(location);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        when(userRepository.findById(20L)).thenReturn(Optional.of(supportAgent));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        TicketResponse response = ticketService.resolve(20L, 1L);

        assertNotNull(response);
        assertEquals(now, ticket.getResolvedAt());
        assertEquals(TicketStatus.RESOLVED, ticket.getStatus());

        ArgumentCaptor<TicketEvent> eventCaptor = ArgumentCaptor.forClass(TicketEvent.class);
        verify(ticketEventRepository).save(eventCaptor.capture());
        assertEquals(EventType.STATUS_CHANGED, eventCaptor.getValue().getType());
        assertEquals("RESOLVED", eventCaptor.getValue().getPayload().get("status"));
    }
}
