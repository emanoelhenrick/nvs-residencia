package com.nvs.ams.presentation.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.nvs.ams.presentation.dto.request.CreateTicketRequest;
import com.nvs.ams.presentation.dto.request.AssignTicketRequest;
import com.nvs.ams.presentation.dto.request.ChangeTicketStatusRequest;
import com.nvs.ams.presentation.dto.request.SetTicketPriorityRequest;
import com.nvs.ams.presentation.dto.request.TicketResponseRequest;
import com.nvs.ams.presentation.dto.response.TicketResponse;
import com.nvs.ams.presentation.dto.response.TicketEventResponse;
import com.nvs.ams.services.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping ("/api/v1/tickets")
@RequiredArgsConstructor 
public class TicketController {

    private final TicketService service;

    @PostMapping
    public ResponseEntity<TicketResponse> create(
            @RequestHeader(value = "X-Device-Id", required = false) Long deviceId,
            @RequestHeader ("X-User-Id") Long userId,
            @Valid @RequestBody CreateTicketRequest body) {

        TicketResponse created = service.create(userId, deviceId, body);
        return ResponseEntity
                .created(URI.create("/api/v1/tickets/" + created.id()))
                .body(created);
    }

    @GetMapping // Lista os chamados do usuário
    public List<TicketResponse> list(@RequestHeader("X-User-Id") Long userId) {
        return service.list(userId);
    }

    @GetMapping("/{id}")// Retorna os detalhes de um chamado específico
    public TicketResponse get(@RequestHeader("X-User-Id") Long userId,
                              @PathVariable Long id) {
        return service.get(userId, id);
    }

    @GetMapping("/{id}/events")//histórico de eventos
    public List<TicketEventResponse> events(
            @RequestHeader("X-User-Id") Long userId, @PathVariable Long id) {
        return service.getEvents(userId, id);
    }

    @PatchMapping("/{id}/priority")// Permite que um usuário com permissão de gerente ou administrador defina a prioridade de um chamado como p1, p2 ou p3. A prioridade é usada para determinar o tempo de resposta esperado para o chamado.
    public TicketResponse setPriority(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody SetTicketPriorityRequest body) {
        return service.setPriority(userId, id, body);
    }

    @PostMapping("/{id}/responses")//a equipe vai registrar a primeira resposta do chamado.
    public TicketResponse respond(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody TicketResponseRequest body) {
        return service.recordResponse(userId, id, body);
    }

    @PostMapping("/{id}/resolve")//A equipe vai registrar a resolução do chamado, indicando que o problema foi resolvido e o chamado pode ser fechado.
    public TicketResponse resolve(@RequestHeader("X-User-Id") Long userId,
                                  @PathVariable Long id) {
        return service.resolve(userId, id);
    }

    @PatchMapping("/{id}/status")
    public TicketResponse changeStatus(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody ChangeTicketStatusRequest body) {
        return service.changeStatus(userId, id, body);
    }

    @PostMapping("/{id}/reopen")
    public TicketResponse reopen(@RequestHeader("X-User-Id") Long userId,
                                 @PathVariable Long id) {
        return service.reopen(userId, id);
    }

    @PutMapping("/{id}/assignment")
    public TicketResponse assignTeam(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketRequest body) {
        return service.assignTeam(userId, id, body);
    }
}
