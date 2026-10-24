package com.claimora;

import com.claimora.entity.Role;
import com.claimora.entity.User;
import com.claimora.entity.UserStatus;
import com.claimora.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class AuthControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setupDatabase() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        userRepository.deleteAll();

        // Create an active user
        User activeUser = new User(
                "Active Test User",
                "test.active@claimora.internal",
                passwordEncoder.encode("Password123!"),
                Role.STAFF,
                UserStatus.ACTIVE
        );
        userRepository.save(activeUser);

        // Create an inactive user
        User inactiveUser = new User(
                "Inactive Test User",
                "test.inactive@claimora.internal",
                passwordEncoder.encode("Password123!"),
                Role.STAFF,
                UserStatus.INACTIVE
        );
        userRepository.save(inactiveUser);
    }

    @Test
    @DisplayName("POST /api/auth/login returns 200 and JWT on valid credentials")
    void testLogin_Success() throws Exception {
        String body = "{\"email\":\"test.active@claimora.internal\",\"password\":\"Password123!\"}";

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("test.active@claimora.internal")))
                .andExpect(jsonPath("$.user.role", is("STAFF")))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/auth/login returns 401 with generic error on invalid password")
    void testLogin_InvalidPassword_Returns401() throws Exception {
        String body = "{\"email\":\"test.active@claimora.internal\",\"password\":\"WrongPassword99!\"}";

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    @DisplayName("POST /api/auth/login returns 403 when user is INACTIVE")
    void testLogin_InactiveUser_Returns403() throws Exception {
        String body = "{\"email\":\"test.inactive@claimora.internal\",\"password\":\"Password123!\"}";

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.message", containsString("inactive")));
    }

    @Test
    @DisplayName("POST /api/auth/register creates STAFF user by default and returns 201")
    void testRegister_Success() throws Exception {
        String body = "{\"name\":\"New Employee\",\"email\":\"new.staff@claimora.internal\",\"password\":\"SecurePass123!\"}";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("new.staff@claimora.internal")))
                .andExpect(jsonPath("$.user.role", is("STAFF")));
    }

    @Test
    @DisplayName("POST /api/auth/register fails with 400 when email is already registered")
    void testRegister_DuplicateEmail_Returns400() throws Exception {
        String body = "{\"name\":\"Duplicate\",\"email\":\"test.active@claimora.internal\",\"password\":\"SecurePass123!\"}";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("already registered")));
    }
}
