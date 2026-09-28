package com.filacerta.config.security;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;

@Service
public class TokenService {
	// Chave secreta da sua aplicação (num projeto real, ficaria no application.yml)
	private final String secret = "mikael-lanches-super-secreto-123";

	public String gerarToken(String username) {
		return JWT.create().withIssuer("FilaCerta").withSubject(username)
				// AQUI: Mudamos de plusHours(12) para plusMinutes(15)
				.withExpiresAt(LocalDateTime.now().plusMinutes(15).toInstant(ZoneOffset.of("-03:00")))
				.sign(Algorithm.HMAC256(secret));
	}

	// Gera um token que dura 7 dias, usado APENAS para renovar o token principal
	public String gerarRefreshToken(String username) {
		return JWT.create().withIssuer("FilaCerta").withSubject(username)
				.withExpiresAt(LocalDateTime.now().plusDays(7).toInstant(ZoneOffset.of("-03:00")))
				.sign(Algorithm.HMAC256(secret));
	}

	public String validarToken(String token) {
		try {
			return JWT.require(Algorithm.HMAC256(secret)).withIssuer("FilaCerta").build().verify(token).getSubject();
		} catch (JWTVerificationException exception) {
			return ""; // Token inválido ou expirado
		}
	}
}