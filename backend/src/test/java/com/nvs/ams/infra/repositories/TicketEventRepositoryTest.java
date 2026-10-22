package com.nvs.ams.infra.repositories;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class TicketEventRepositoryTest {

    @Autowired
    private TicketEventRepository ticketEventRepository;

    @Test
    @DisplayName("Repository should be injected and start empty")
    void repositoryIsPresentAndEmpty() {
        assertNotNull(ticketEventRepository, "TicketEventRepository should be autowired");
        long count = ticketEventRepository.count();
        assertEquals(0L, count, "Database should be empty at start of test");
    }
}
