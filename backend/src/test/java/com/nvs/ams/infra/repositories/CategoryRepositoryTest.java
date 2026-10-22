package com.nvs.ams.infra.repositories;

import com.nvs.ams.domain.models.Category;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class CategoryRepositoryTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    @DisplayName("Repository should be injected and start empty")
    void repositoryIsPresentAndEmpty() {
        assertNotNull(categoryRepository, "CategoryRepository should be autowired");
        long count = categoryRepository.count();
        assertEquals(0L, count, "Database should be empty at start of test");
    }

    @Test
    @DisplayName("Deve persistir e buscar categoria por ID")
    void shouldPersistAndFindCategory() {
        Category category = new Category();
        category.setName("Pagamento / POS");

        Category saved = categoryRepository.saveAndFlush(category);

        assertNotNull(saved.getId());
        Optional<Category> found = categoryRepository.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("Pagamento / POS", found.get().getName());
    }
}
