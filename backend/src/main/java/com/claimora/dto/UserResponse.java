package com.claimora.dto;

import com.claimora.entity.Role;
import com.claimora.entity.UserStatus;

import java.time.Instant;

/**
 * Standard user representation returned by APIs.
 * Sensitive fields (password_hash) are strictly excluded.
 */
public class UserResponse {

    private Long userId;
    private String name;
    private String email;
    private Role role;
    private UserStatus status;
    private Instant createdAt;

    public UserResponse() {
    }

    public UserResponse(Long userId, String name, String email, Role role, UserStatus status, Instant createdAt) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static UserResponse fromEntity(com.claimora.entity.User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
