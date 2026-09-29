package com.filacerta.config.security;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;

@Service
public class LoginRateLimiter {
    
    // Guarda o "balde" de tentativas de cada usuário na memória
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String username) {
        return cache.computeIfAbsent(username, this::novoBucket);
    }

    private Bucket novoBucket(String username) {
        // Nova sintaxe do Bucket4j 8+
        Bandwidth limit = Bandwidth.builder()
                .capacity(5)
                .refillGreedy(1, Duration.ofMinutes(5))
                .build();
                
        return Bucket.builder().addLimit(limit).build();
    }
}