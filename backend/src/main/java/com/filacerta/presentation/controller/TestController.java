package com.filacerta.presentation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@Tag(name = "Teste", description = "Endpoint para testes")
public class TestController {

    @GetMapping
    @Operation(summary = "Testar API", description = "Retorna status da API")
    public Map<String, Object> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Fila Certa API rodando!");
        response.put("timestamp", LocalDateTime.now());
        return response;
    }
}