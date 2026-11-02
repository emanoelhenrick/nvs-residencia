package com.nvs.ams.presentation.controller;

import com.nvs.ams.config.JwtUtil;
import com.nvs.ams.domain.models.User;
import com.nvs.ams.infra.repositories.UserRepository;
import com.nvs.ams.presentation.dto.request.LoginRequest;
import com.nvs.ams.presentation.dto.request.RegisterRequest;
import com.nvs.ams.presentation.dto.request.RegisterStaffRequest;
import com.nvs.ams.presentation.dto.response.AuthResponse;
import com.nvs.ams.services.auth.RegisterNewUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nvs.ams.presentation.exception.ApiException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterNewUserService registerNewUserService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = registerNewUserService.registerRequester(
            request.name(),
            request.email(),
            request.password(),
            request.locationId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user));
    }

    @PostMapping("/register/staff")
    @PreAuthorize("hasAuthority('LEADER')")
    public ResponseEntity<AuthResponse> registerStaff(
            @Valid @RequestBody RegisterStaffRequest request) {
        User user = registerNewUserService.registerStaff(
                request.name(),
                request.email(),
                request.password(),
                request.role(),
                request.teamId());

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findUserByEmail(request.email())
                .filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPassword()))
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED, "Email ou senha inválidos"));

        return toResponse(user);
    }

    private AuthResponse toResponse(User user) {
        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                user.getName());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name());
    }
}
