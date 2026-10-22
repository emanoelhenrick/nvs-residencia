package com.nvs.ams.infra.repositories;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class TicketRepositoryTest {

    @Autowired
    private TicketRepository ticketRepository;

    @Test
    @DisplayName("Repository should be injected and start empty")
    void repositoryIsPresentAndEmpty() {
        assertNotNull(ticketRepository, "TicketRepository should be autowired");
        long count = ticketRepository.count();
        assertEquals(0L, count, "Database should be empty at start of test");
    }

    @Test
    @DisplayName("Should generate next protocol number from sequence")
    void shouldGenerateNextProtocolNumber() {
        long protocolNumber1 = ticketRepository.nextProtocolNumber();
        long protocolNumber2 = ticketRepository.nextProtocolNumber();

        assertTrue(protocolNumber1 > 0, "Protocol number should be positive");
        assertEquals(protocolNumber1 + 1, protocolNumber2, "Protocol numbers should be sequential");
    }
}
