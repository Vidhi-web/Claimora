package com.claimora.dto;

import java.time.Instant;

/**
 * Data Transfer Object for User information (excludes password hashes).
 * Owner: Vidhi (User + Authentication)
 */
public class UserDto {

    private Long userId;
    private String name;
    private String email;
    private String role;
    private String status;
    private Instant createdAt;

    public UserDto() {
    }

    public UserDto(Long userId, String name, String email, String role, String status, Instant createdAt) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
