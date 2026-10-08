package com.nvs.ams.infra.repositories;

import com.nvs.ams.domain.models.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Repository should be injected and start empty")
    void repositoryIsPresentAndEmpty() {
        assertNotNull(userRepository, "UserRepository should be autowired");
        long count = userRepository.count();
        assertEquals(0L, count, "Database should be empty at start of test");
    }
}
