package com.nvs.ams.infra.repositories;

import com.nvs.ams.domain.models.*;
import com.nvs.ams.domain.models.enums.EventType;
import com.nvs.ams.domain.models.enums.LocationType;
import com.nvs.ams.domain.models.enums.TicketStatus;
import com.nvs.ams.domain.models.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class TicketEventRepositoryTest {

    @Autowired
    private TicketEventRepository ticketEventRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Repository should be injected and start empty")
    void repositoryIsPresentAndEmpty() {
        assertNotNull(ticketEventRepository, "TicketEventRepository should be autowired");
        long count = ticketEventRepository.count();
        assertEquals(0L, count, "Database should be empty at start of test");
    }

    @Test
    @DisplayName("Deve persistir e recuperar TicketEvent com payload JSON e actor")
    void shouldPersistAndRetrieveTicketEventWithPayload() {
        Location location = new Location();
        location.setCode("LJ-100");
        location.setName("Loja Evento");
        location.setType(LocationType.STORE);
        entityManager.persist(location);

        Category category = new Category();
        category.setName("Software");
        entityManager.persist(category);

        User actor = new User();
        actor.setName("João Atendente");
        actor.setEmail("joao@teste.com");
        actor.setRole(UserRole.TRIAGE_AGENT);
        actor.setLocation(location);
        entityManager.persist(actor);

        Ticket ticket = new Ticket();
        ticket.setProtocol("NX-2026-999999");
        ticket.setDescription("Teste de evento com JSON");
        ticket.setCategory(category);
        ticket.setLocation(location);
        ticket.setRequester(actor);
        ticket.setStatus(TicketStatus.OPEN);
        entityManager.persist(ticket);

        Map<String, Object> payload = Map.of("channel", "PORTAL", "ip", "192.168.1.1");
        TicketEvent event = new TicketEvent(ticket, EventType.CREATED, actor, payload);

        TicketEvent saved = ticketEventRepository.saveAndFlush(event);

        assertNotNull(saved.getId());
        Optional<TicketEvent> found = ticketEventRepository.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals(EventType.CREATED, found.get().getType());
        assertEquals("PORTAL", found.get().getPayload().get("channel"));
        assertEquals("192.168.1.1", found.get().getPayload().get("ip"));
        assertEquals(actor.getId(), found.get().getActor().getId());
        assertNotNull(found.get().getCreatedAt());
    }
}
