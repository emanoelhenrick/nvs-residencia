package com.nvs.ams.presentation.controller;

import com.nvs.ams.domain.models.User;
import com.nvs.ams.infra.repositories.UserRepository;
import com.nvs.ams.presentation.dto.response.SessionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SessionController {

    private final UserRepository users;

    @GetMapping("/me")
    @Transactional(readOnly = true)
    public SessionResponse me(@AuthenticationPrincipal User user) {
        User currentUser = users.findById(user.getId()).orElse(user);
        return SessionResponse.from(currentUser);
    }
}
