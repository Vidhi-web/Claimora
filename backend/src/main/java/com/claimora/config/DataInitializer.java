package com.claimora.config;

import com.claimora.entity.Role;
import com.claimora.entity.User;
import com.claimora.entity.UserStatus;
import com.claimora.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Startup seeder creating default ADMIN account from environment variables
 * if no ADMIN account exists in the database.
 * No hardcoded credentials.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${claimora.admin.email:${ADMIN_EMAIL:admin@claimora.internal}}")
    private String adminEmail;

    @Value("${claimora.admin.password:${ADMIN_PASSWORD:Admin123!}}")
    private String adminPassword;

    @Value("${claimora.admin.name:${ADMIN_NAME:Claimora Administrator}}")
    private String adminName;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByRole(Role.ADMIN)) {
            log.info("No ADMIN account detected. Seeding default ADMIN from environment configuration...");
            User admin = new User(
                    adminName.trim(),
                    adminEmail.trim().toLowerCase(),
                    passwordEncoder.encode(adminPassword),
                    Role.ADMIN,
                    UserStatus.ACTIVE
            );
            userRepository.save(admin);
            log.info("Default ADMIN successfully created: {}", adminEmail);
        } else {
            log.info("Existing ADMIN account found. Skipping admin seed.");
        }
    }
}
