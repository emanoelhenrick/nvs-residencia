package com.nvs.ams.infra.repositories;

import com.nvs.ams.domain.models.Device;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class DeviceRepositoryTest {

    @Autowired
    private DeviceRepository deviceRepository;

    @Test
    @DisplayName("Repository should be injected and start empty")
    void repositoryIsPresentAndEmpty() {
        assertNotNull(deviceRepository, "DeviceRepository should be autowired");
        long count = deviceRepository.count();
        assertEquals(0L, count, "Database should be empty at start of test");
    }
}
