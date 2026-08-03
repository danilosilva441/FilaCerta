package com.filacerta.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
				// 👇 ESSA É A LINHA QUE PERMITE O PREFLIGHT PASSAR
				.cors(Customizer.withDefaults()).csrf(csrf -> csrf.disable()) // Provavelmente você já usa isso para sua
																				// API
				.authorizeHttpRequests(auth -> auth.requestMatchers("/api/auth/**").permitAll() // Seus endpoints
																								// públicos
						.anyRequest().authenticated());

		return http.build();
	}
}
