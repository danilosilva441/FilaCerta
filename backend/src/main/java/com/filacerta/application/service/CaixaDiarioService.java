package com.filacerta.application.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.domain.entity.CaixaDiario;
import com.filacerta.domain.enums.StatusCaixa;
import com.filacerta.domain.exception.CaixaNaoEncontradoException;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.infrastructure.repository.CaixaDiarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class CaixaDiarioService {

	private final CaixaDiarioRepository caixaDiarioRepository;

	public void abrirCaixa() {
		log.info("Abrindo caixa do dia: {}", LocalDate.now());

		// Verificar se já existe um caixa aberto para hoje
		boolean existeCaixaHoje = caixaDiarioRepository.existsByDataAndStatus(LocalDate.now(), StatusCaixa.ABERTO);

		if (existeCaixaHoje) {
			throw new NegocioException("Já existe um caixa aberto para hoje");
		}

		// Verificar se já existe um caixa fechado para hoje
		boolean existeCaixaFechado = caixaDiarioRepository.existsByDataAndStatus(LocalDate.now(), StatusCaixa.FECHADO);

		if (existeCaixaFechado) {
			throw new NegocioException("O caixa de hoje já foi fechado. Não é possível reabrir.");
		}

		CaixaDiario caixa = new CaixaDiario();
		caixa.setData(LocalDate.now());
		caixa.setHoraAbertura(LocalTime.now());
		caixa.setValorInicial(BigDecimal.ZERO);
		caixa.setStatus(StatusCaixa.ABERTO);
		caixa.setTotalDinheiro(BigDecimal.ZERO);
		caixa.setTotalDebito(BigDecimal.ZERO);
		caixa.setTotalCredito(BigDecimal.ZERO);
		caixa.setTotalPix(BigDecimal.ZERO);
		caixa.setTotalFiado(BigDecimal.ZERO);
		caixa.setTotalPedidos(0);
		caixa.setTotalCancelados(0);

		caixaDiarioRepository.save(caixa);
		log.info("Caixa do dia {} aberto com sucesso", LocalDate.now());
	}

	public void fecharCaixa() {
		log.info("Fechando caixa do dia: {}", LocalDate.now());

		CaixaDiario caixa = caixaDiarioRepository.findByDataAndStatus(LocalDate.now(), StatusCaixa.ABERTO)
				.orElseThrow(() -> new NegocioException("Não há caixa aberto para hoje"));

		caixa.setStatus(StatusCaixa.FECHADO);
		caixa.setHoraFechamento(LocalTime.now());

		caixaDiarioRepository.save(caixa);
		log.info("Caixa do dia {} fechado com sucesso", LocalDate.now());
	}

	public CaixaDiario buscarCaixaDoDia() {
		log.info("Buscando caixa do dia: {}", LocalDate.now());
		return caixaDiarioRepository.findByDataAndStatus(LocalDate.now(), StatusCaixa.ABERTO)
				.orElseThrow(() -> new CaixaNaoEncontradoException(LocalDate.now()));
	}

	public CaixaDiario buscarCaixaPorData(LocalDate data) {
		log.info("Buscando caixa da data: {}", data);
		return caixaDiarioRepository.findByDataAndStatus(data, StatusCaixa.ABERTO)
				.orElseThrow(() -> new CaixaNaoEncontradoException(data));
	}
}