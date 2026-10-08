package com.nvs.ams;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
@Import(SecurityConfig.class)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve retornar status 200 OK e JSON {\"status\":\"ONLINE\"} ao chamar GET /health")
    void shouldReturnOnlineStatus() throws Exception {
        mockMvc.perform(get("/health").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("ONLINE"));
    }

    @Test
    @DisplayName("Deve rejeitar requisições POST para /health com código 4xx (método não permitido)")
    void shouldRejectPostMethodOnHealth() throws Exception {
        mockMvc.perform(post("/health"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("Deve rejeitar requisições DELETE para /health com código 4xx (método não permitido)")
    void shouldRejectDeleteMethodOnHealth() throws Exception {
        mockMvc.perform(delete("/health"))
                .andExpect(status().is4xxClientError());
    }
}
