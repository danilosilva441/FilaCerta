package com.filacerta.config.security;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;

@Service
public class TokenService {
    private final String secret = "mikael-lanches-super-secreto-123";

    // Adicionado o parâmetro 'versao' aqui
    public String gerarToken(String username, Integer versao) {
        return JWT.create().withIssuer("FilaCerta")
                .withSubject(username)
                .withClaim("versao", versao) // O CARIMBO da versão vai aqui
                .withExpiresAt(LocalDateTime.now().plusMinutes(15).toInstant(ZoneOffset.of("-03:00")))
                .sign(Algorithm.HMAC256(secret));
    }

    public String gerarRefreshToken(String username) {
        return JWT.create().withIssuer("FilaCerta")
                .withSubject(username)
                .withExpiresAt(LocalDateTime.now().plusDays(7).toInstant(ZoneOffset.of("-03:00")))
                .sign(Algorithm.HMAC256(secret));
    }
    
    // Método que abre o Token e tenta ler a versão
    public Integer getVersaoToken(String token) {
        try {
            Algorithm algoritmo = Algorithm.HMAC256(secret);
            return JWT.require(algoritmo)
                    .withIssuer("FilaCerta")
                    .build()
                    .verify(token)
                    .getClaim("versao").asInt();
        } catch (JWTVerificationException exception) {
            return null; // Retorna null se não houver versão no token
        }
    }

    public String validarToken(String token) {
        try {
            return JWT.require(Algorithm.HMAC256(secret)).withIssuer("FilaCerta").build().verify(token).getSubject();
        } catch (JWTVerificationException exception) {
            return ""; 
        }
    }
}