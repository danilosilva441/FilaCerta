package com.filacerta.application.mapper;

import com.filacerta.application.dto.response.UsuarioResponse;
import com.filacerta.domain.entity.Usuario;

public class UsuarioMapper {

    public static UsuarioResponse toResponse(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        
        UsuarioResponse response = new UsuarioResponse();
        response.setId(usuario.getId());
        response.setUsername(usuario.getUsername());
        response.setRole(usuario.getRole());
        
        return response;
    }
}