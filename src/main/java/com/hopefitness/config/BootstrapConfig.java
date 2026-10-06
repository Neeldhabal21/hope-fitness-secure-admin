package com.hopefitness.config;

import com.hopefitness.entity.AdminUser;
import com.hopefitness.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class BootstrapConfig {
    @Bean
    CommandLineRunner createInitialAdmin(
            AdminUserRepository repo,
            PasswordEncoder encoder,
            @Value("${app.initial-admin.username:}") String username,
            @Value("${app.initial-admin.password:}") String password) {
        return args -> {
            if (username == null || username.isBlank() || password == null || password.isBlank()) return;
            if (repo.findByUsername(username).isEmpty()) {
                AdminUser user = new AdminUser();
                user.setUsername(username.trim());
                user.setPasswordHash(encoder.encode(password));
                user.setRole("ADMIN");
                repo.save(user);
                System.out.println("Initial admin created for username: " + username.trim());
            }
        };
    }
}
