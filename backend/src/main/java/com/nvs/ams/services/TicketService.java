package com.nvs.ams.services;

import java.time.Year;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.nvs.ams.domain.models.Category;
import com.nvs.ams.domain.models.Device;
import com.nvs.ams.domain.models.Location;
import com.nvs.ams.domain.models.Ticket;
import com.nvs.ams.domain.models.TicketEvent;
import com.nvs.ams.domain.models.User;
import com.nvs.ams.domain.models.enums.EventType;
import com.nvs.ams.domain.models.enums.UserRole;
import com.nvs.ams.infra.repositories.CategoryRepository;
import com.nvs.ams.infra.repositories.DeviceRepository;
import com.nvs.ams.infra.repositories.TicketEventRepository;
import com.nvs.ams.infra.repositories.TicketRepository;
import com.nvs.ams.infra.repositories.UserRepository;
import com.nvs.ams.presentation.dto.request.CreateTicketRequest;
import com.nvs.ams.presentation.dto.response.TicketResponse;
import com.nvs.ams.presentation.exception.ApiException;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class TicketService {

    private final TicketRepository tickets;
    private final TicketEventRepository events;
    private final UserRepository users;
    private final CategoryRepository categories;
    private final DeviceRepository devices;

    @Transactional 
    public TicketResponse create(Long userId, Long deviceId, CreateTicketRequest req) {

        User requester = users.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));

        Location location = requester.getLocation();
        if (location == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Usuário sem loja/CD associada");
        }

        Category category = categories.findById(req.categoryId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST, "Categoria inválida"));

        Device device = null;
        if (deviceId != null) {
            device = devices.findById(deviceId)
                    .orElseThrow(() -> new ApiException(
                            HttpStatus.BAD_REQUEST, "Dispositivo inválido"));
            if (!device.getLocation().getId().equals(location.getId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "O dispositivo não pertence à loja/CD do usuário");
            }
        }

        Ticket ticket = new Ticket();
        ticket.setProtocol(generateProtocol());
        ticket.setDescription(req.description().trim());
        ticket.setCategory(category);
        ticket.setRequester(requester);
        ticket.setLocation(location);
        ticket.setDevice(device);
        tickets.save(ticket);

        events.save(new TicketEvent(ticket, EventType.CREATED, requester,
                Map.of("channel", "PORTAL")));

        return TicketResponse.from(ticket);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> list(Long userId) {
        User user = findUser(userId);
        List<Ticket> result = (user.getRole() == UserRole.REQUESTER)
                ? tickets.findByRequesterIdOrderByOpenedAtDesc(user.getId())
                : tickets.findAllByOrderByOpenedAtDesc();
        return result.stream().map(TicketResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TicketResponse get(Long userId, Long ticketId) {
        User user = findUser(userId);
        Ticket ticket = tickets.findById(ticketId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Chamado não encontrado"));

        if (user.getRole() == UserRole.REQUESTER
                && !ticket.getRequester().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return TicketResponse.from(ticket);
    }

    private User findUser(Long userId) {
        return users.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));
    }

    private String generateProtocol() {
        return String.format("NX-%d-%06d",
                Year.now().getValue(), tickets.nextProtocolNumber());
    }
}