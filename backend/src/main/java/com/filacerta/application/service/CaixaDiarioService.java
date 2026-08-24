package com.filacerta.application.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.response.CaixaDiarioResponse;
import com.filacerta.domain.entity.CaixaDiario;
import com.filacerta.domain.enums.StatusCaixa;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.infrastructure.repository.CaixaDiarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CaixaDiarioService {

	private final CaixaDiarioRepository caixaDiarioRepository;

	@Transactional(readOnly = true)
	public CaixaDiario buscarCaixaAberto() {
		return caixaDiarioRepository.findByStatus(StatusCaixa.ABERTO).orElseThrow(
				() -> new NegocioException("Não é possível realizar pedidos: Nenhum caixa aberto no momento."));
	}

	@Transactional(readOnly = true)
	public CaixaDiarioResponse buscarCaixaAtual() {
		return caixaDiarioRepository.findByStatus(StatusCaixa.ABERTO).map(this::toResponse).orElse(null);
	}

	@Transactional
	public CaixaDiarioResponse abrirCaixa(BigDecimal valorInicial) {
		LocalDate hoje = LocalDate.now();

		// Procura se já existe um caixa para a data de hoje
		CaixaDiario caixaExistente = caixaDiarioRepository.findAll().stream().filter(c -> c.getData().equals(hoje))
				.findFirst().orElse(null);

		if (caixaExistente != null) {
			if (StatusCaixa.ABERTO.equals(caixaExistente.getStatus())) {
				throw new NegocioException("Já existe um caixa aberto para hoje.");
			}
			// Reabre o caixa existente do dia
			caixaExistente.setStatus(StatusCaixa.ABERTO);
			caixaExistente.setHoraAbertura(LocalDateTime.now());
			caixaExistente.setHoraFechamento(null);
			caixaExistente.setValorInicial(valorInicial);
			return toResponse(caixaDiarioRepository.save(caixaExistente));
		}

		// Se não existe nenhum para hoje, cria do zero
		CaixaDiario novoCaixa = new CaixaDiario();
		novoCaixa.setData(hoje);
		novoCaixa.setHoraAbertura(LocalDateTime.now());
		novoCaixa.setValorInicial(valorInicial);
		novoCaixa.setTotalDinheiro(BigDecimal.ZERO);
		novoCaixa.setTotalPedidos(0);
		novoCaixa.setStatus(StatusCaixa.ABERTO);

		return toResponse(caixaDiarioRepository.save(novoCaixa));
	}

	@Transactional
	public CaixaDiarioResponse fecharCaixa() {
		CaixaDiario caixaAberto = caixaDiarioRepository.findByStatus(StatusCaixa.ABERTO)
				.orElseThrow(() -> new NegocioException("Nenhum caixa aberto encontrado."));

		caixaAberto.setStatus(StatusCaixa.FECHADO); // Usando Enum
		caixaAberto.setHoraFechamento(LocalDateTime.now());

		return toResponse(caixaDiarioRepository.save(caixaAberto));
	}

	private CaixaDiarioResponse toResponse(CaixaDiario caixa) {
		return CaixaDiarioResponse.builder().id(caixa.getId()).data(caixa.getData())
				.horaAbertura(caixa.getHoraAbertura()).horaFechamento(caixa.getHoraFechamento())
				.valorInicial(caixa.getValorInicial()).totalDinheiro(caixa.getTotalDinheiro())
				.totalPedidos(caixa.getTotalPedidos()).status(caixa.getStatus()).build();
	}
}