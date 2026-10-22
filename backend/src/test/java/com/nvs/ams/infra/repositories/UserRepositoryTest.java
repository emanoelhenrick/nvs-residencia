package com.nvs.ams.infra.repositories;

import com.nvs.ams.domain.models.Location;
import com.nvs.ams.domain.models.Team;
import com.nvs.ams.domain.models.User;
import com.nvs.ams.domain.models.enums.LocationType;
import com.nvs.ams.domain.models.enums.TeamLevel;
import com.nvs.ams.domain.models.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Repository should be injected and start empty")
    void repositoryIsPresentAndEmpty() {
        assertNotNull(userRepository, "UserRepository should be autowired");
        long count = userRepository.count();
        assertEquals(0L, count, "Database should be empty at start of test");
    }

    @Test
    @DisplayName("Deve persistir e recuperar User com Location e Team")
    void shouldPersistAndFindUserWithLocationAndTeam() {
        Location location = new Location();
        location.setCode("CD-001");
        location.setName("CD Central");
        location.setType(LocationType.DISTRIBUTION_CENTER);
        entityManager.persist(location);

        Team team = new Team();
        team.setName("Suporte N1");
        team.setLevel(TeamLevel.N1);
        entityManager.persist(team);

        User user = new User();
        user.setName("Lucas Atendente");
        user.setEmail("lucas@nexo.com");
        user.setRole(UserRole.TRIAGE_AGENT);
        user.setLocation(location);
        user.setTeam(team);

        User saved = userRepository.saveAndFlush(user);

        assertNotNull(saved.getId());
        Optional<User> found = userRepository.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("Lucas Atendente", found.get().getName());
        assertEquals("lucas@nexo.com", found.get().getEmail());
        assertEquals(UserRole.TRIAGE_AGENT, found.get().getRole());
        assertEquals("CD-001", found.get().getLocation().getCode());
        assertEquals("Suporte N1", found.get().getTeam().getName());
    }
}
