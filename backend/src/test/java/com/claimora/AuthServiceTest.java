package com.claimora;

import com.claimora.dto.LoginRequest;
import com.claimora.dto.LoginResponse;
import com.claimora.dto.RegisterRequest;
import com.claimora.entity.Role;
import com.claimora.entity.User;
import com.claimora.entity.UserStatus;
import com.claimora.exception.ValidationException;
import com.claimora.repository.UserRepository;
import com.claimora.security.JwtService;
import com.claimora.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    @DisplayName("Registration successfully hashes password with BCrypt and assigns default STAFF role")
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest("Jane Staff", "jane.staff@claimora.internal", "Password123!");

        when(userRepository.existsByEmail("jane.staff@claimora.internal")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("$2a$12$hashedPassword");

        User savedUser = new User("Jane Staff", "jane.staff@claimora.internal", "$2a$12$hashedPassword", Role.STAFF, UserStatus.ACTIVE);
        savedUser.setUserId(10L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(savedUser)).thenReturn("mocked-jwt-token");

        LoginResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.getToken());
        assertEquals("Jane Staff", response.getUser().getName());
        assertEquals(Role.STAFF, response.getUser().getRole());
        assertEquals(UserStatus.ACTIVE, response.getUser().getStatus());
        verify(passwordEncoder).encode("Password123!");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Registration with existing email is rejected with ValidationException")
    void testRegister_DuplicateEmail_Rejected() {
        RegisterRequest request = new RegisterRequest("Existing User", "existing@claimora.internal", "Password123!");
        when(userRepository.existsByEmail("existing@claimora.internal")).thenReturn(true);

        ValidationException ex = assertThrows(ValidationException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("already registered"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Login with valid credentials returns JWT and user summary")
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("admin@claimora.internal", "Password123!");
        User user = new User("Admin", "admin@claimora.internal", "$2a$12$hashed", Role.ADMIN, UserStatus.ACTIVE);
        user.setUserId(1L);

        when(userRepository.findByEmail("admin@claimora.internal")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123!", "$2a$12$hashed")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("mocked-jwt-token");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.getToken());
        assertEquals("Admin", response.getUser().getName());
        assertEquals(Role.ADMIN, response.getUser().getRole());
    }

    @Test
    @DisplayName("Login with unknown email returns generic 'Invalid email or password' error")
    void testLogin_UnknownEmail_GenericError() {
        LoginRequest request = new LoginRequest("unknown@claimora.internal", "Password123!");
        when(userRepository.findByEmail("unknown@claimora.internal")).thenReturn(Optional.empty());

        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () -> authService.login(request));
        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    @DisplayName("Login with wrong password returns generic 'Invalid email or password' error")
    void testLogin_WrongPassword_GenericError() {
        LoginRequest request = new LoginRequest("admin@claimora.internal", "WrongPassword!");
        User user = new User("Admin", "admin@claimora.internal", "$2a$12$hashed", Role.ADMIN, UserStatus.ACTIVE);

        when(userRepository.findByEmail("admin@claimora.internal")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword!", "$2a$12$hashed")).thenReturn(false);

        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () -> authService.login(request));
        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    @DisplayName("Login by an INACTIVE user is blocked with DisabledException")
    void testLogin_InactiveUser_Blocked() {
        LoginRequest request = new LoginRequest("inactive@claimora.internal", "Password123!");
        User user = new User("Suspended User", "inactive@claimora.internal", "$2a$12$hashed", Role.STAFF, UserStatus.INACTIVE);

        when(userRepository.findByEmail("inactive@claimora.internal")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123!", "$2a$12$hashed")).thenReturn(true);

        DisabledException ex = assertThrows(DisabledException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("inactive"));
    }
}
