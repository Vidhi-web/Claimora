package com.claimora;

import com.claimora.dto.AdminCreateUserRequest;
import com.claimora.dto.ChangePasswordRequest;
import com.claimora.dto.UpdateUserRequest;
import com.claimora.dto.UserResponse;
import com.claimora.entity.Role;
import com.claimora.entity.User;
import com.claimora.entity.UserStatus;
import com.claimora.exception.ValidationException;
import com.claimora.repository.UserRepository;
import com.claimora.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Admin creates user with custom role and status")
    void testCreateUser_Success() {
        AdminCreateUserRequest request = new AdminCreateUserRequest(
                "Alex Investigator", "alex@claimora.internal", "SecurePass123!", Role.INVESTIGATOR, UserStatus.ACTIVE
        );

        when(userRepository.existsByEmail("alex@claimora.internal")).thenReturn(false);
        when(passwordEncoder.encode("SecurePass123!")).thenReturn("$2a$12$encodedHash");

        User savedUser = new User("Alex Investigator", "alex@claimora.internal", "$2a$12$encodedHash", Role.INVESTIGATOR, UserStatus.ACTIVE);
        savedUser.setUserId(5L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse response = userService.createUser(request);

        assertNotNull(response);
        assertEquals(5L, response.getUserId());
        assertEquals(Role.INVESTIGATOR, response.getRole());
        assertEquals("alex@claimora.internal", response.getEmail());
        verify(passwordEncoder).encode("SecurePass123!");
    }

    @Test
    @DisplayName("Admin creates user with duplicate email fails with ValidationException")
    void testCreateUser_DuplicateEmail_ThrowsException() {
        AdminCreateUserRequest request = new AdminCreateUserRequest(
                "Duplicate", "dup@claimora.internal", "SecurePass123!", Role.STAFF, UserStatus.ACTIVE
        );
        when(userRepository.existsByEmail("dup@claimora.internal")).thenReturn(true);

        ValidationException ex = assertThrows(ValidationException.class, () -> userService.createUser(request));
        assertTrue(ex.getMessage().contains("already registered"));
    }

    @Test
    @DisplayName("Admin updates user status (activate / deactivate)")
    void testUpdateStatus_Success() {
        User user = new User("User", "user@claimora.internal", "hash", Role.STAFF, UserStatus.ACTIVE);
        user.setUserId(7L);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateStatus(7L, UserStatus.INACTIVE);

        assertEquals(UserStatus.INACTIVE, response.getStatus());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Admin updates user role (assign role)")
    void testUpdateRole_Success() {
        User user = new User("User", "user@claimora.internal", "hash", Role.STAFF, UserStatus.ACTIVE);
        user.setUserId(7L);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateRole(7L, Role.INVESTIGATOR);

        assertEquals(Role.INVESTIGATOR, response.getRole());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("User changes password successfully when current password matches")
    void testChangePassword_Success() {
        User user = new User("User", "user@claimora.internal", "$2a$12$oldHash", Role.STAFF, UserStatus.ACTIVE);
        when(userRepository.findByEmail("user@claimora.internal")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("OldPassword123!", "$2a$12$oldHash")).thenReturn(true);
        when(passwordEncoder.matches("NewPassword456!", "$2a$12$oldHash")).thenReturn(false);
        when(passwordEncoder.encode("NewPassword456!")).thenReturn("$2a$12$newHash");

        ChangePasswordRequest request = new ChangePasswordRequest("OldPassword123!", "NewPassword456!");
        userService.changePassword("user@claimora.internal", request);

        assertEquals("$2a$12$newHash", user.getPasswordHash());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("User changing password with incorrect current password fails")
    void testChangePassword_IncorrectCurrent_Fails() {
        User user = new User("User", "user@claimora.internal", "$2a$12$oldHash", Role.STAFF, UserStatus.ACTIVE);
        when(userRepository.findByEmail("user@claimora.internal")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongCurrent!", "$2a$12$oldHash")).thenReturn(false);

        ChangePasswordRequest request = new ChangePasswordRequest("WrongCurrent!", "NewPassword456!");
        ValidationException ex = assertThrows(ValidationException.class, () -> userService.changePassword("user@claimora.internal", request));
        assertTrue(ex.getMessage().contains("Current password does not match"));
        verify(userRepository, never()).save(any(User.class));
    }
}
