package com.nvs.ams;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
@Import(SecurityConfig.class)
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Endpoint /health deve ser público (permitir acesso sem autenticação)")
    void shouldAllowAnonymousAccessToHealthEndpoint() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Qualquer outro endpoint deve exigir autenticação (retornar 401 ou 403 para anônimos)")
    void shouldRequireAuthenticationForOtherEndpoints() throws Exception {
        mockMvc.perform(get("/api/chamados"))
                .andExpect(status().is4xxClientError());
    }
}
