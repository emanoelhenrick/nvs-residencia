package com.nvs.ams;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import com.nvs.ams.config.SecurityConfig;
import com.nvs.ams.services.TicketService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest
@Import(SecurityConfig.class)
class AmsApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private TicketService ticketService;

	@Test
	void healthEndpointReturnsUp() throws Exception {
		mockMvc.perform(get("/health"))
				.andExpect(status().isOk())
				.andExpect(content().json("{\"status\":\"ONLINE\"}"));
	}

}
