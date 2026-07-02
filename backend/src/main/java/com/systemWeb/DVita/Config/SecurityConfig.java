package com.systemWeb.DVita.Config;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
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
                    .requestMatchers(HttpMethod.POST, "/api/consultas/**").permitAll()
                    .requestMatchers("/api/consultas/**").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/tipos-habitacion/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/clientes/dni/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/clientes").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/reniec/dni/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/habitaciones/disponibles**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/reservas/**").permitAll()
                    .requestMatchers("/api/clientes/**").authenticated()
                    .requestMatchers("/api/empleados/**").authenticated()
                    .requestMatchers("/api/habitaciones/**").authenticated()
                    .requestMatchers("/api/tipos-habitacion/**").authenticated()
                    .requestMatchers("/api/reservas/**").authenticated()
                    .requestMatchers("/api/pagos/**").authenticated()
                    .requestMatchers("/api/usuarios/**").authenticated()
                    .requestMatchers("/api/permisos/**").authenticated()
                    .requestMatchers("/api/incidencias/**").authenticated()
                    .requestMatchers("/api/areas/**").authenticated()
                    .requestMatchers("/api/horarios/**").authenticated()
                    .requestMatchers("/api/dashboard/**").authenticated()
                    .requestMatchers("/api/recepcionistas/**").authenticated()
                    .requestMatchers("/api/administradores/**").authenticated()
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
