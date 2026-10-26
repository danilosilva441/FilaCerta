package com.filacerta.config.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.filacerta.domain.entity.Usuario;
import com.filacerta.infrastructure.repository.UsuarioRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter {

	private final TokenService tokenService;
	private final UsuarioRepository usuarioRepository; // Adicionado aqui

	public SecurityFilter(TokenService tokenService, UsuarioRepository usuarioRepository) {
		this.tokenService = tokenService;
		this.usuarioRepository = usuarioRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		String token = recoverToken(request);

		if (token != null) {
			String subject = tokenService.validarToken(token);

			if (!subject.isEmpty()) {
				Integer versaoNoToken = tokenService.getVersaoToken(token);

				// Vai ao banco ver qual é a versão real da conta hoje
				Usuario usuarioReal = usuarioRepository.findByUsername(subject).orElse(null);
				// Se a versão do Token for igual à versão do Banco de Dados = ACESSO PERMITIDO!
				if (usuarioReal != null && versaoNoToken != null
						&& versaoNoToken.equals(usuarioReal.getVersaoToken())) {

					// Limpa espaços invisíveis e garante que está tudo em maiúsculo
					String roleDoBanco = usuarioReal.getRole().name();

					// Log visual para termos certeza absoluta do que está a ser injetado
					System.out.println("🔐 [SECURITY] Autenticando: " + subject + " | Permissão: " + roleDoBanco);

					var authentication = new UsernamePasswordAuthenticationToken(subject, null,
							List.of(new SimpleGrantedAuthority(roleDoBanco)));

					SecurityContextHolder.getContext().setAuthentication(authentication);
				}
			}
		}
		filterChain.doFilter(request, response);
	}

	private String recoverToken(HttpServletRequest request) {
		String authHeader = request.getHeader("Authorization");
		if (authHeader == null)
			return null;
		return authHeader.replace("Bearer ", "");
	}
}