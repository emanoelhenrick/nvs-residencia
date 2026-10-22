package com.nvs.ams.infra.repositories;

import com.nvs.ams.domain.models.Category;
import com.nvs.ams.domain.models.Location;
import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.User;
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
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class TicketRepositoryTest {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TestEntityManager entityManager;

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

    @Test
    @DisplayName("Deve salvar ticket e preencher openedAt automaticamente via @PrePersist")
    void shouldPersistTicketAndAutoPopulateOpenedAt() {
        Location location = createAndPersistLocation("LJ-001", "Loja 1");
        Category category = createAndPersistCategory("PDV");
        User user = createAndPersistUser("Maria", "maria@teste.com", location);

        Ticket ticket = new Ticket();
        ticket.setProtocol("NX-2026-000001");
        ticket.setDescription("Falha no leitor de código de barras");
        ticket.setCategory(category);
        ticket.setLocation(location);
        ticket.setRequester(user);
        ticket.setStatus(TicketStatus.OPEN);

        Ticket saved = ticketRepository.saveAndFlush(ticket);

        assertNotNull(saved.getId());
        assertNotNull(saved.getOpenedAt(), "openedAt deve ser preenchido pelo @PrePersist");
    }

    @Test
    @DisplayName("Deve filtrar chamados por solicitante em ordem decrescente de abertura")
    void shouldFindByRequesterIdOrderByOpenedAtDesc() {
        Location location = createAndPersistLocation("LJ-002", "Loja 2");
        Category category = createAndPersistCategory("Rede");
        User user1 = createAndPersistUser("Carlos", "carlos@teste.com", location);
        User user2 = createAndPersistUser("Ana", "ana@teste.com", location);

        Instant now = Instant.now();

        Ticket t1 = new Ticket();
        t1.setProtocol("NX-2026-000001");
        t1.setDescription("Chamado mais antigo do user1");
        t1.setCategory(category);
        t1.setLocation(location);
        t1.setRequester(user1);
        t1.setOpenedAt(now.minus(2, ChronoUnit.HOURS));
        entityManager.persist(t1);

        Ticket t2 = new Ticket();
        t2.setProtocol("NX-2026-000002");
        t2.setDescription("Chamado mais recente do user1");
        t2.setCategory(category);
        t2.setLocation(location);
        t2.setRequester(user1);
        t2.setOpenedAt(now);
        entityManager.persist(t2);

        Ticket t3 = new Ticket();
        t3.setProtocol("NX-2026-000003");
        t3.setDescription("Chamado do user2");
        t3.setCategory(category);
        t3.setLocation(location);
        t3.setRequester(user2);
        t3.setOpenedAt(now.minus(1, ChronoUnit.HOURS));
        entityManager.persist(t3);

        entityManager.flush();

        List<Ticket> user1Tickets = ticketRepository.findByRequesterIdOrderByOpenedAtDesc(user1.getId());

        assertEquals(2, user1Tickets.size(), "Deve retornar apenas os 2 chamados do user1");
        assertEquals("NX-2026-000002", user1Tickets.get(0).getProtocol(), "Mais recente deve vir primeiro");
        assertEquals("NX-2026-000001", user1Tickets.get(1).getProtocol(), "Mais antigo deve vir depois");
    }

    @Test
    @DisplayName("Deve listar todos os chamados em ordem decrescente de abertura")
    void shouldFindAllByOrderByOpenedAtDesc() {
        Location location = createAndPersistLocation("LJ-003", "Loja 3");
        Category category = createAndPersistCategory("Impressora");
        User user = createAndPersistUser("Pedro", "pedro@teste.com", location);

        Instant now = Instant.now();

        Ticket older = new Ticket();
        older.setProtocol("NX-2026-000010");
        older.setDescription("Chamado 1");
        older.setCategory(category);
        older.setLocation(location);
        older.setRequester(user);
        older.setOpenedAt(now.minus(1, ChronoUnit.DAYS));
        entityManager.persist(older);

        Ticket newer = new Ticket();
        newer.setProtocol("NX-2026-000011");
        newer.setDescription("Chamado 2");
        newer.setCategory(category);
        newer.setLocation(location);
        newer.setRequester(user);
        newer.setOpenedAt(now);
        entityManager.persist(newer);

        entityManager.flush();

        List<Ticket> all = ticketRepository.findAllByOrderByOpenedAtDesc();

        assertEquals(2, all.size());
        assertEquals("NX-2026-000011", all.get(0).getProtocol());
        assertEquals("NX-2026-000010", all.get(1).getProtocol());
    }

    private Location createAndPersistLocation(String code, String name) {
        Location loc = new Location();
        loc.setCode(code);
        loc.setName(name);
        loc.setType(LocationType.STORE);
        return entityManager.persist(loc);
    }

    private Category createAndPersistCategory(String name) {
        Category cat = new Category();
        cat.setName(name);
        return entityManager.persist(cat);
    }

    private User createAndPersistUser(String name, String email, Location location) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setRole(UserRole.REQUESTER);
        u.setLocation(location);
        return entityManager.persist(u);
    }
}
