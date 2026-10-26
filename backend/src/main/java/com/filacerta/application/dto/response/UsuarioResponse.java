package com.filacerta.application.dto.response;

import com.filacerta.domain.enums.Role;

import lombok.Data;

@Data
public class UsuarioResponse {
    private Long id;
    private String username;
    private Role role;
}