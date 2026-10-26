package com.filacerta.application.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.request.AlterarSenhaRequest;
import com.filacerta.application.dto.response.UsuarioResponse;
import com.filacerta.application.mapper.UsuarioMapper;
import com.filacerta.domain.entity.Usuario;
import com.filacerta.domain.enums.Role;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.infrastructure.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponse criarUsuarioManualmente(String username, String rawPassword, String role) {
        if (usuarioRepository.findByUsername(username).isPresent()) {
            throw new NegocioException("Este nome de usuário já existe.");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(rawPassword));
        usuario.setRole(Role.valueOf(role.toUpperCase()));
        usuario.setVersaoToken(0);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        
        // Retorna o DTO limpo, sem expor dados sensíveis
        return UsuarioMapper.toResponse(usuarioSalvo); 
    }

    @Transactional
    public void alterarSenha(String username, AlterarSenhaRequest request) {
        
        // ---> NOVA REGRA: Valida se as senhas coincidem antes de ir ao banco <---
        if (!request.getNovaSenha().equals(request.getConfirmarSenhaNova())) {
            throw new NegocioException("A nova senha e a confirmação não coincidem.");
        }
        
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NegocioException("Usuário não encontrado."));

        if (!passwordEncoder.matches(request.getSenhaAtual(), usuario.getPassword())) {
            throw new NegocioException("A senha atual está incorreta.");
        }

        usuario.setPassword(passwordEncoder.encode(request.getNovaSenha()));
        usuario.setVersaoToken(usuario.getVersaoToken() + 1);

        usuarioRepository.save(usuario);
    }
}