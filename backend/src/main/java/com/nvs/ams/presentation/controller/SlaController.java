package com.nvs.ams.presentation.controller;

import com.nvs.ams.presentation.dto.response.SlaReportResponse;
import com.nvs.ams.presentation.dto.response.SlaViolationResponse;
import com.nvs.ams.services.SlaReportingService;
import com.nvs.ams.domain.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sla")
@RequiredArgsConstructor
public class SlaController {

    private final SlaReportingService service;

    @GetMapping("/report")
    public SlaReportResponse report(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.report(user.getId(), from, to);
    }

    @GetMapping("/violations")
    public List<SlaViolationResponse> violations(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.violations(user.getId(), from, to);
    }
}
