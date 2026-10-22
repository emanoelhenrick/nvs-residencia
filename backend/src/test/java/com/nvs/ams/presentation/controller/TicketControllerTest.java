package com.nvs.ams.presentation.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nvs.ams.config.SecurityConfig;
import com.nvs.ams.presentation.dto.request.CreateTicketRequest;
import com.nvs.ams.presentation.dto.response.TicketResponse;
import com.nvs.ams.presentation.exception.ApiException;
import com.nvs.ams.presentation.exception.ApiExceptionHandler;
import com.nvs.ams.services.TicketService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TicketController.class)
@Import({SecurityConfig.class, ApiExceptionHandler.class})
@ActiveProfiles("test")
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @MockitoBean
    private TicketService ticketService;

    @Test
    @DisplayName("Deve criar chamado via POST e retornar 201 Created")
    void shouldCreateTicketAndReturn201() throws Exception {
        CreateTicketRequest request = new CreateTicketRequest("Problema no terminal de pagamento", 1L);
        TicketResponse response = new TicketResponse(
                100L, "NX-2026-000001", "Problema no terminal de pagamento",
                "PDV", "Loja Boa Viagem", "OPEN", Instant.now());

        when(ticketService.create(eq(10L), eq(5L), any(CreateTicketRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/tickets")
                        .header("X-User-Id", 10L)
                        .header("X-Device-Id", 5L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/v1/tickets/100"))
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.protocol").value("NX-2026-000001"))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    @DisplayName("Deve rejeitar criação de chamado sem header X-User-Id com 400 Bad Request")
    void shouldRejectTicketCreationWithoutUserHeader() throws Exception {
        CreateTicketRequest request = new CreateTicketRequest("Problema no terminal de pagamento", 1L);

        mockMvc.perform(post("/api/v1/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve rejeitar criação de chamado com validação inválida e retornar ProblemDetail com campos")
    void shouldRejectTicketCreationWithInvalidPayload() throws Exception {
        CreateTicketRequest request = new CreateTicketRequest("Curto", 1L);

        mockMvc.perform(post("/api/v1/tickets")
                        .header("X-User-Id", 10L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Dados inválidos"))
                .andExpect(jsonPath("$.fields.description").value("A descrição deve ter entre 10 e 2000 caracteres"));
    }

    @Test
    @DisplayName("Deve listar chamados via GET /api/v1/tickets")
    void shouldListTickets() throws Exception {
        TicketResponse response = new TicketResponse(
                100L, "NX-2026-000001", "Problema no terminal de pagamento",
                "PDV", "Loja Boa Viagem", "OPEN", Instant.now());

        when(ticketService.list(10L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/tickets")
                        .header("X-User-Id", 10L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].protocol").value("NX-2026-000001"));
    }

    @Test
    @DisplayName("Deve buscar chamado por ID via GET /api/v1/tickets/{id}")
    void shouldGetTicketById() throws Exception {
        TicketResponse response = new TicketResponse(
                100L, "NX-2026-000001", "Problema no terminal de pagamento",
                "PDV", "Loja Boa Viagem", "OPEN", Instant.now());

        when(ticketService.get(10L, 100L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/tickets/100")
                        .header("X-User-Id", 10L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.protocol").value("NX-2026-000001"));
    }

    @Test
    @DisplayName("Deve retornar 404 Not Found quando chamado não existir")
    void shouldReturn404WhenTicketNotFound() throws Exception {
        when(ticketService.get(10L, 999L))
                .thenThrow(new ApiException(HttpStatus.NOT_FOUND, "Chamado não encontrado"));

        mockMvc.perform(get("/api/v1/tickets/999")
                        .header("X-User-Id", 10L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Chamado não encontrado"));
    }

    @Test
    @DisplayName("Deve retornar 403 Forbidden quando usuário tentar acessar chamado de outro solicitante")
    void shouldReturn403WhenAccessDenied() throws Exception {
        when(ticketService.get(10L, 100L))
                .thenThrow(new ApiException(HttpStatus.FORBIDDEN, "Acesso negado"));

        mockMvc.perform(get("/api/v1/tickets/100")
                        .header("X-User-Id", 10L))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("Acesso negado"));
    }

    @Test
    @DisplayName("Deve retornar 401 Unauthorized quando usuário não for encontrado")
    void shouldReturn401WhenUserNotFound() throws Exception {
        CreateTicketRequest request = new CreateTicketRequest("Problema no terminal de pagamento", 1L);

        when(ticketService.create(eq(99L), any(), any()))
                .thenThrow(new ApiException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));

        mockMvc.perform(post("/api/v1/tickets")
                        .header("X-User-Id", 99L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Usuário não encontrado"));
    }
}
