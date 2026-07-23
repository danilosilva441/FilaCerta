package com.filacerta.application.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.request.CriarClienteRequest;
import com.filacerta.application.dto.request.LoginRequest;
import com.filacerta.application.dto.response.AuthResponse;
import com.filacerta.domain.entity.Cliente;
import com.filacerta.domain.entity.SessaoCliente;
import com.filacerta.domain.entity.Usuario;
import com.filacerta.domain.enums.TipoUsuario;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.infrastructure.repository.ClienteRepository;
import com.filacerta.infrastructure.repository.SessaoClienteRepository;
import com.filacerta.infrastructure.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AuthService {

	private final ClienteRepository clienteRepository;
	private final UsuarioRepository usuarioRepository;
	private final SessaoClienteRepository sessaoClienteRepository;

	// ===== CLIENTE =====

	public AuthResponse registrarCliente(CriarClienteRequest request) {
		log.info("Registrando novo cliente: {} {}", request.getNome(), request.getSobrenome());

		String codigo = gerarCodigoCliente();

		Cliente cliente = new Cliente();
		cliente.setNome(request.getNome());
		cliente.setSobrenome(request.getSobrenome());
		cliente.setCodigo(codigo);
		cliente.setAtivo(true);

		cliente = clienteRepository.save(cliente);

		// Criar sessão
		String token = gerarToken();
		SessaoCliente sessao = new SessaoCliente();
		sessao.setCliente(cliente);
		sessao.setToken(token);
		sessao.setDataHoraInicio(LocalDateTime.now());
		sessao.setAtivo(true);
		sessaoClienteRepository.save(sessao);

		log.info("Cliente {} registrado com código: {}", cliente.getNomeCompleto(), codigo);

		return AuthResponse.builder().success(true).token(token).codigoCliente(codigo)
				.nomeCliente(cliente.getNomeCompleto()).message("Cliente registrado com sucesso!").build();
	}

	public AuthResponse loginCliente(String codigo) {
		log.info("Login do cliente com código: {}", codigo);

		Cliente cliente = clienteRepository.findByCodigo(codigo)
				.orElseThrow(() -> new NegocioException("Cliente não encontrado com código: " + codigo));

		if (!cliente.getAtivo()) {
			throw new NegocioException("Cliente inativo");
		}

		// Verificar se já tem sessão ativa
		SessaoCliente sessao = sessaoClienteRepository.findByClienteIdAndAtivoTrue(cliente.getId()).orElseGet(() -> {
			// Criar nova sessão
			SessaoCliente novaSessao = new SessaoCliente();
			novaSessao.setCliente(cliente);
			novaSessao.setToken(gerarToken());
			novaSessao.setDataHoraInicio(LocalDateTime.now());
			novaSessao.setAtivo(true);
			return sessaoClienteRepository.save(novaSessao);
		});

		log.info("Cliente {} logado com sucesso", cliente.getNomeCompleto());

		return AuthResponse.builder().success(true).token(sessao.getToken()).codigoCliente(cliente.getCodigo())
				.nomeCliente(cliente.getNomeCompleto()).message("Login realizado com sucesso!").build();
	}

	public void logoutCliente(String token) {
		log.info("Logout do cliente com token: {}", token);

		SessaoCliente sessao = sessaoClienteRepository.findByTokenAndAtivoTrue(token)
				.orElseThrow(() -> new NegocioException("Sessão não encontrada"));

		sessao.setAtivo(false);
		sessao.setDataHoraFim(LocalDateTime.now());
		sessaoClienteRepository.save(sessao);

		log.info("Logout realizado com sucesso");
	}

	public AuthResponse validarSessao(String token) {
		SessaoCliente sessao = sessaoClienteRepository.findByTokenAndAtivoTrue(token)
				.orElseThrow(() -> new NegocioException("Sessão inválida ou expirada"));

		Cliente cliente = sessao.getCliente();

		return AuthResponse.builder().success(true).token(token).codigoCliente(cliente.getCodigo())
				.nomeCliente(cliente.getNomeCompleto()).message("Sessão válida").build();
	}

	public Cliente getClienteByToken(String token) {
		SessaoCliente sessao = sessaoClienteRepository.findByTokenAndAtivoTrue(token)
				.orElseThrow(() -> new NegocioException("Sessão inválida ou expirada"));
		return sessao.getCliente();
	}

	// ===== USUÁRIO (DONO) =====

	public AuthResponse loginUsuario(LoginRequest request) {
		log.info("Login do usuário: {}", request.getUsername());

		Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
				.orElseThrow(() -> new NegocioException("Usuário não encontrado"));

		if (!usuario.getAtivo()) {
			throw new NegocioException("Usuário inativo");
		}

		// Em produção, usar BCrypt para validar senha
		if (!usuario.getPassword().equals(request.getPassword())) {
			throw new NegocioException("Senha incorreta");
		}

		log.info("Usuário {} logado com sucesso", usuario.getUsername());

		return AuthResponse.builder().success(true).tipo(usuario.getTipo().name()).nomeCliente(usuario.getNome())
				.message("Login realizado com sucesso!").build();
	}

	public void criarUsuarioInicial() {
		if (!usuarioRepository.existsByUsername("dono")) {
			Usuario usuario = new Usuario();
			usuario.setUsername("dono");
			usuario.setPassword("123456"); // Em produção, usar BCrypt
			usuario.setNome("Dono do Estabelecimento");
			usuario.setTipo(TipoUsuario.DONO);
			usuario.setAtivo(true);
			usuarioRepository.save(usuario);
			log.info("Usuário inicial criado: dono / 123456");
		}
	}

	// ===== MÉTODOS PRIVADOS =====

	private String gerarCodigoCliente() {
		int totalClientes = (int) clienteRepository.count() + 1;
		return "CLI-" + String.format("%04d", totalClientes);
	}

	private String gerarToken() {
		return UUID.randomUUID().toString().replace("-", "").substring(0, 32);
	}
}