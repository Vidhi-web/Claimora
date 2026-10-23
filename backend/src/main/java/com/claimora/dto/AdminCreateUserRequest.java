package com.claimora.dto;

import com.claimora.entity.Role;
import com.claimora.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Admin request payload for directly creating users with explicit role and status.
 */
public class AdminCreateUserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
            message = "Password must be at least 8 characters long and contain both letters and numbers"
    )
    private String password;

    @NotNull(message = "Role is required")
    private Role role = Role.STAFF;

    @NotNull(message = "Status is required")
    private UserStatus status = UserStatus.ACTIVE;

    public AdminCreateUserRequest() {
    }

    public AdminCreateUserRequest(String name, String email, String password, Role role, UserStatus status) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role != null ? role : Role.STAFF;
        this.status = status != null ? status : UserStatus.ACTIVE;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
}
