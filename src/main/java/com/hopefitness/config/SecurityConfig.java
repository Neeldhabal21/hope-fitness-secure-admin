package com.hopefitness.config;

import com.hopefitness.security.CustomUserDetailsService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    DaoAuthenticationProvider authenticationProvider(PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(encoder);
        return provider;
    }

    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "https://hope-fitness-secure-admin.vercel.app"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        CookieCsrfTokenRepository csrf =
                CookieCsrfTokenRepository.withHttpOnlyFalse();

        CsrfTokenRequestAttributeHandler handler =
                new CsrfTokenRequestAttributeHandler();

        http
            .cors(c -> {})
            .csrf(c -> c
                .csrfTokenRepository(csrf)
                .csrfTokenRequestHandler(handler)
            )

            .sessionManagement(s ->
                s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )

            .authorizeHttpRequests(a -> a

                .requestMatchers(
                    "/",
                    "/index.html",
                    "/style.css",
                    "/script.js",
                    "/PHOTO-SOURCE-NOTE.txt",
                    "/admin/login.html",
                    "/admin/admin.css",
                    "/admin/login.js",
                    "/api/auth/login",
                    "/api/auth/csrf"
                ).permitAll()

                .requestMatchers("/api/leads").permitAll()

                .requestMatchers(
                    "/admin/**",
                    "/api/admin/**",
                    "/api/auth/me",
                    "/api/auth/logout"
                ).hasRole("ADMIN")

                .anyRequest().permitAll()
            )

            .formLogin(f -> f.disable())

            .httpBasic(b -> b.disable())

            .logout(l -> l
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler(
                    (req, res, auth) -> res.setStatus(204)
                )
                .invalidateHttpSession(true)
                .deleteCookies(
                    "HOPE_FITNESS_SESSION",
                    "XSRF-TOKEN"
                )
            );

        return http.build();
    }
}