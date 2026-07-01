package com.systemWeb.DVita.Config;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor

public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                corsConfig.setAllowedOrigins(List.of(
                        "http://localhost:5173",
                        "http://localhost:3000",
                        "http://127.0.0.1:5173"));
                corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                corsConfig.setAllowedHeaders(List.of("*"));
                corsConfig.setAllowCredentials(true);
                return corsConfig;
            }))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/clientes/**").hasAnyRole("ADMINISTRADOR", "GERENTE", "RECEPCIONISTA")
                    .requestMatchers("/api/empleados/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                    .requestMatchers("/api/habitaciones/**").hasAnyRole("ADMINISTRADOR", "GERENTE", "RECEPCIONISTA", "MANTENIMIENTO", "LIMPIEZA")
                    .requestMatchers("/api/tipos-habitacion/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                    .requestMatchers("/api/reservas/**").hasAnyRole("ADMINISTRADOR", "GERENTE", "RECEPCIONISTA")
                    .requestMatchers("/api/pagos/**").hasAnyRole("ADMINISTRADOR", "GERENTE", "RECEPCIONISTA")
                    .requestMatchers("/api/usuarios/**").hasRole("ADMINISTRADOR")
                    .requestMatchers("/api/permisos/**").hasRole("ADMINISTRADOR")
                    .requestMatchers("/api/incidencias/**").hasAnyRole("ADMINISTRADOR", "GERENTE", "MANTENIMIENTO", "LIMPIEZA", "CHATBOT")
                    .requestMatchers("/api/areas/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                    .requestMatchers("/api/horarios/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                    .requestMatchers("/api/dashboard/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                    .requestMatchers("/api/recepcionistas/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                    .requestMatchers("/api/administradores/**").hasAnyRole("ADMINISTRADOR", "GERENTE")
                    .requestMatchers("/api/email/**").authenticated()
                    .requestMatchers("/api/reniec/**").authenticated()
                    .requestMatchers("/api/chat/**").authenticated()
                    .requestMatchers("/actuator/health").permitAll()
                    .requestMatchers("/error").permitAll()
                    .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
