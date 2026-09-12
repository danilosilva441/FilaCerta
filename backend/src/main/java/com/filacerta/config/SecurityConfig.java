package com.filacerta.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// Importe o SecurityFilter (ajuste o pacote dependendo de onde você for criar ele)
import com.filacerta.config.security.SecurityFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	private final SecurityFilter securityFilter;

	// O Spring Boot injeta o nosso filtro JWT aqui automaticamente
	public SecurityConfig(SecurityFilter securityFilter) {
		this.securityFilter = securityFilter;
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.csrf(AbstractHttpConfigurer::disable).cors(cors -> cors.configure(http))

				// ATENÇÃO: Desliga a sessão padrão do Spring, pois usaremos o Token JWT
				// (Stateless)
				.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				.authorizeHttpRequests(auth -> auth
						// 1. A MÁGICA: Liberar as requisições "fantasmas" (Preflight CORS) do navegador
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

						// Liberar Swagger e H2 Console
						.requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
						.requestMatchers("/h2-console/**").permitAll()

						// Liberar rotas públicas do Cliente e Login (adicionamos /** para cobrir barras
						// no final da URL)
						.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/produtos/**", "/api/produtos").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/pedidos/**", "/api/pedidos").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/pedidos/**").permitAll()
						.requestMatchers(HttpMethod.PATCH, "/api/pedidos/*/cancelar").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/caixa/atual").permitAll()

						// Qualquer outra requisição precisará do Token JWT (Acesso restrito do Dono)
						.anyRequest().authenticated())

				// Necessário para o console do H2 funcionar em frames
				.headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))

				// Adiciona o nosso segurança (Filtro JWT) na porta do Spring Boot
				.addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}