package com.nvs.ams.infra.repositories;

import com.nvs.ams.domain.models.Device;
import com.nvs.ams.domain.models.Location;
import com.nvs.ams.domain.models.enums.DeviceType;
import com.nvs.ams.domain.models.enums.LocationType;
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
class DeviceRepositoryTest {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Repository should be injected and start empty")
    void repositoryIsPresentAndEmpty() {
        assertNotNull(deviceRepository, "DeviceRepository should be autowired");
        long count = deviceRepository.count();
        assertEquals(0L, count, "Database should be empty at start of test");
    }

    @Test
    @DisplayName("Deve persistir e buscar dispositivo vinculado a uma localização")
    void shouldPersistAndFindDevice() {
        Location location = new Location();
        location.setCode("LJ-005");
        location.setName("Loja Shopping");
        location.setType(LocationType.STORE);
        entityManager.persist(location);

        Device device = new Device();
        device.setIdentifier("PDV-005");
        device.setType(DeviceType.POS);
        device.setLocation(location);

        Device saved = deviceRepository.saveAndFlush(device);

        assertNotNull(saved.getId());
        Optional<Device> found = deviceRepository.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("PDV-005", found.get().getIdentifier());
        assertEquals(DeviceType.POS, found.get().getType());
        assertEquals("LJ-005", found.get().getLocation().getCode());
    }
}
