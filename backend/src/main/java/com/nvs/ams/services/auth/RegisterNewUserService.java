package com.nvs.ams.services.auth;

import com.nvs.ams.domain.models.User;
import com.nvs.ams.domain.models.Location;
import com.nvs.ams.domain.models.Team;
import com.nvs.ams.domain.models.enums.UserRole;
import com.nvs.ams.infra.repositories.LocationRepository;
import com.nvs.ams.infra.repositories.TeamRepository;
import com.nvs.ams.infra.repositories.UserRepository;
import com.nvs.ams.presentation.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterNewUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private TeamRepository teamRepository;

    public User registerRequester(String name, String email, String password, Long locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Localização não encontrada"));
        return register(name, email, password, UserRole.REQUESTER, location, null);
    }

    public User registerStaff(
            String name, String email, String password, UserRole role, Long teamId) {
        if (role == UserRole.REQUESTER) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "REQUESTER deve ser cadastrado pelo endpoint público");
        }

        Team team = null;
        if (requiresTeam(role)) {
            if (teamId == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "O perfil informado exige uma equipe");
            }
            team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipe não encontrada"));
        } else if (teamId != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "O perfil informado não deve possuir equipe");
        }

        return register(name, email, password, role, null, team);
    }

    private User register(
            String name, String email, String password, UserRole role,
            Location location, Team team) {
        var userExists = userRepository.findUserByEmail(email).isPresent();
        if (userExists) {
            throw new ApiException(HttpStatus.CONFLICT, "Email já registrado");
        }

        var encodedPassword = passwordEncoder.encode(password);
        var newUser = new User(name, email, encodedPassword, role);
        newUser.setLocation(location);
        newUser.setTeam(team);

        return userRepository.save(newUser);
    }

    private boolean requiresTeam(UserRole role) {
        return role == UserRole.TRIAGE_AGENT
                || role == UserRole.SPECIALIST
                || role == UserRole.SUPPLIER;
    }
}
