package com.nvs.ams.presentation.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.nvs.ams.presentation.dto.request.CreateTicketRequest;
import com.nvs.ams.presentation.dto.response.TicketResponse;
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
            @RequestHeader ("X-User-Id") Long userId,
            @RequestHeader(value = "X-Device-Id", required = false) Long deviceId,
            @Valid @RequestBody CreateTicketRequest body) {

        TicketResponse created = service.create(userId, deviceId, body);
        return ResponseEntity
                .created(URI.create("/api/v1/tickets/" + created.id()))
                .body(created);
    }

    @GetMapping 
    public List<TicketResponse> list(@RequestHeader("X-User-Id") Long userId) {
        return service.list(userId);
    }

    @GetMapping("/{id}")
    public TicketResponse get(@RequestHeader("X-User-Id") Long userId,
                              @PathVariable Long id) {
        return service.get(userId, id);
    }
}
