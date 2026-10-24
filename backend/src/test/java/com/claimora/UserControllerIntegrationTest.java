package com.claimora;

import com.claimora.entity.Role;
import com.claimora.entity.User;
import com.claimora.entity.UserStatus;
import com.claimora.repository.UserRepository;
import com.claimora.security.JwtService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class UserControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String adminToken;
    private String staffToken;
    private User staffUser;

    @BeforeEach
    void setupDatabase() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        userRepository.deleteAll();

        User adminUser = new User("Vidhi Admin", "admin.test@claimora.internal", passwordEncoder.encode("AdminPass123!"), Role.ADMIN, UserStatus.ACTIVE);
        userRepository.save(adminUser);
        adminToken = jwtService.generateToken(adminUser);

        staffUser = new User("Staff Member", "staff.test@claimora.internal", passwordEncoder.encode("StaffPass123!"), Role.STAFF, UserStatus.ACTIVE);
        userRepository.save(staffUser);
        staffToken = jwtService.generateToken(staffUser);
    }

    @Test
    @DisplayName("GET /api/users without authentication returns 401 Unauthorized as JSON")
    void testGetUsers_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    @Test
    @DisplayName("GET /api/users by STAFF role returns 403 Forbidden as JSON")
    void testGetUsers_StaffRole_Returns403() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.error", is("Forbidden")))
                .andExpect(jsonPath("$.message", containsString("insufficient role privileges")));
    }

    @Test
    @DisplayName("GET /api/users by ADMIN role returns 200 and paginated user list")
    void testGetUsers_AdminRole_Returns200() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$.content[0].passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/users by ADMIN creates INVESTIGATOR user and returns 201")
    void testAdminCreateUser_Success() throws Exception {
        String body = "{\"name\":\"Chinmay Forensic\",\"email\":\"chinmay.forensic@claimora.internal\",\"password\":\"StrongPass123!\",\"role\":\"INVESTIGATOR\",\"status\":\"ACTIVE\"}";

        mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role", is("INVESTIGATOR")))
                .andExpect(jsonPath("$.email", is("chinmay.forensic@claimora.internal")));
    }

    @Test
    @DisplayName("PATCH /api/users/{id}/status by ADMIN updates status to INACTIVE")
    void testAdminUpdateStatus_Success() throws Exception {
        String body = "{\"status\":\"INACTIVE\"}";

        mockMvc.perform(patch("/api/users/" + staffUser.getUserId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("INACTIVE")));
    }

    @Test
    @DisplayName("PATCH /api/users/{id}/role by ADMIN updates role to INVESTIGATOR")
    void testAdminUpdateRole_Success() throws Exception {
        String body = "{\"role\":\"INVESTIGATOR\"}";

        mockMvc.perform(patch("/api/users/" + staffUser.getUserId() + "/role")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("INVESTIGATOR")));
    }

    @Test
    @DisplayName("PUT /api/users/me/password by authenticated user changes password successfully")
    void testChangePassword_Success() throws Exception {
        String body = "{\"currentPassword\":\"StaffPass123!\",\"newPassword\":\"NewStaffPass456!\"}";

        mockMvc.perform(put("/api/users/me/password")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("successfully")));
    }
}
