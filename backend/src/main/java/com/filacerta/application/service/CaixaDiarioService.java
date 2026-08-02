package com.filacerta.application.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.domain.entity.CaixaDiario;
import com.filacerta.domain.entity.Pedido;
import com.filacerta.domain.enums.StatusCaixa;
import com.filacerta.domain.exception.CaixaFechadoException;
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

	/**
	 * ABRIR CAIXA - Início do dia
	 */
	public void abrirCaixa() {
		log.info("Abrindo caixa do dia: {}", LocalDate.now());

		boolean existeCaixaHoje = caixaDiarioRepository.existsByData(LocalDate.now());

		if (existeCaixaHoje) {
			CaixaDiario caixaExistente = caixaDiarioRepository.findByData(LocalDate.now())
					.orElseThrow(() -> new NegocioException("Erro ao verificar caixa existente"));

			if (caixaExistente.getStatus() == StatusCaixa.ABERTO || caixaExistente.getStatus() == StatusCaixa.PAUSADO) {
				throw new NegocioException("Já existe um caixa ABERTO para hoje");
			} else {
				throw new NegocioException("O caixa de hoje já foi FECHADO. Não é possível reabrir no mesmo dia.");
			}
		}

		CaixaDiario caixa = new CaixaDiario();
		caixa.setData(LocalDate.now());
		caixa.setHoraAbertura(LocalTime.now());
		caixa.setValorInicial(new BigDecimal("100.00")); // ← Definir valor inicial
		caixa.setStatus(StatusCaixa.ABERTO);
		caixa.setTotalDinheiro(BigDecimal.ZERO);
		caixa.setTotalDebito(BigDecimal.ZERO);
		caixa.setTotalCredito(BigDecimal.ZERO);
		caixa.setTotalPix(BigDecimal.ZERO);
		caixa.setTotalFiado(BigDecimal.ZERO);
		caixa.setTotalPedidos(0);
		caixa.setTotalCancelados(0);
		caixa.setTotalConcluidos(0); // ← NOVO
		caixa.setValorTotalConcluidos(BigDecimal.ZERO); // ← NOVO

		caixaDiarioRepository.save(caixa);
		log.info("Caixa do dia {} aberto com sucesso", LocalDate.now());
	}

	/**
	 * PAUSAR ATENDIMENTO - Pausa temporária
	 */
	public void pausarAtendimento(String motivo, String tempoEstimado) {
		log.info("Pausando atendimento do dia: {}", LocalDate.now());

		CaixaDiario caixa = caixaDiarioRepository.findByDataAndStatus(LocalDate.now(), StatusCaixa.ABERTO)
				.orElseThrow(() -> new NegocioException("Não há caixa ABERTO para pausar"));

		caixa.setStatus(StatusCaixa.PAUSADO);
		caixa.setHoraPausa(LocalTime.now());
		caixa.setMotivoPausa(motivo != null ? motivo : "Pausa no atendimento");
		caixa.setTempoEstimadoRetorno(tempoEstimado != null ? tempoEstimado : "alguns minutos"); // ← SALVAR

		caixaDiarioRepository.save(caixa);
		log.info("Atendimento pausado às {}", LocalTime.now());
	}

	/**
	 * REATIVAR ATENDIMENTO - Voltar a atender
	 */
	public void reativarAtendimento() {
		log.info("Reativando atendimento do dia: {}", LocalDate.now());

		CaixaDiario caixa = caixaDiarioRepository.findByDataAndStatus(LocalDate.now(), StatusCaixa.PAUSADO)
				.orElseThrow(() -> new NegocioException("Não há caixa PAUSADO para reativar"));

		caixa.setStatus(StatusCaixa.ABERTO);
		caixa.setHoraReativacao(LocalTime.now());

		caixaDiarioRepository.save(caixa);
		log.info("Atendimento reativado às {}", LocalTime.now());
	}

	/**
	 * FECHAR CAIXA - Fim do dia
	 */
	public void fecharCaixa() {
		log.info("Fechando caixa do dia: {}", LocalDate.now());

		CaixaDiario caixa = caixaDiarioRepository.findByData(LocalDate.now())
				.orElseThrow(() -> new NegocioException("Não há caixa para fechar hoje"));

		if (caixa.getStatus() == StatusCaixa.FECHADO) {
			throw new NegocioException("Caixa já está fechado");
		}

		caixa.setStatus(StatusCaixa.FECHADO);
		caixa.setHoraFechamento(LocalTime.now());

		caixaDiarioRepository.save(caixa);
		log.info("Caixa do dia {} fechado com sucesso", LocalDate.now());
	}

	/**
	 * Validar se o caixa está atendendo
	 */
	public void validarCaixaAtendendo() {
		log.info("Validando se caixa está atendendo...");

		CaixaDiario caixa = caixaDiarioRepository.findByData(LocalDate.now())
				.orElseThrow(() -> new NegocioException("Caixa não aberto hoje"));

		if (caixa.getStatus() == StatusCaixa.FECHADO) {
			throw new CaixaFechadoException("O caixa está FECHADO. Não é possível realizar novos pedidos.");
		}

		if (caixa.getStatus() == StatusCaixa.PAUSADO) {
			throw new CaixaFechadoException("Atendimento PAUSADO. "
					+ (caixa.getMotivoPausa() != null ? "Motivo: " + caixa.getMotivoPausa() : ""));
		}

		log.info("Caixa está atendendo normalmente");
	}

	/**
	 * Buscar o caixa de hoje
	 */
	public CaixaDiario buscarCaixaHoje() {
		log.info("Buscando caixa de hoje: {}", LocalDate.now());
		return caixaDiarioRepository.findByData(LocalDate.now())
				.orElseThrow(() -> new CaixaNaoEncontradoException(LocalDate.now()));
	}

	/**
	 * Verifica se existe caixa ABERTO
	 */
	public boolean existeCaixaAberto() {
		return caixaDiarioRepository.existsByDataAndStatus(LocalDate.now(), StatusCaixa.ABERTO);
	}

	/**
	 * Verifica se existe caixa PAUSADO
	 */
	public boolean existeCaixaPausado() {
		return caixaDiarioRepository.existsByDataAndStatus(LocalDate.now(), StatusCaixa.PAUSADO);
	}

	/**
	 * Verifica se existe caixa FECHADO
	 */
	public boolean existeCaixaFechado() {
		return caixaDiarioRepository.existsByDataAndStatus(LocalDate.now(), StatusCaixa.FECHADO);
	}

	/**
	 * Buscar o caixa aberto
	 */
	public CaixaDiario buscarCaixaAberto() {
		log.info("Buscando caixa aberto do dia: {}", LocalDate.now());
		return caixaDiarioRepository.findByStatus(StatusCaixa.ABERTO)
				.orElseThrow(() -> new CaixaFechadoException("O caixa não está atendendo no momento."));
	}

	/**
	 * Buscar caixa por data específica
	 */
	public CaixaDiario buscarCaixaPorData(LocalDate data) {
		log.info("Buscando caixa da data: {}", data);
		return caixaDiarioRepository.findByData(data).orElseThrow(() -> new CaixaNaoEncontradoException(data));
	}

	/**
	 * Buscar o caixa do dia atual (apenas se estiver ABERTO)
	 */
	public CaixaDiario buscarCaixaDoDia() {
		log.info("Buscando caixa do dia: {}", LocalDate.now());
		return caixaDiarioRepository.findByDataAndStatus(LocalDate.now(), StatusCaixa.ABERTO)
				.orElseThrow(() -> new CaixaNaoEncontradoException(LocalDate.now()));
	}

	/**
	 * Atualizar totais do caixa quando um pedido é concluído
	 */
	public void atualizarTotaisCaixa(Pedido pedido) {
		log.info("Atualizando totais do caixa para pedido: {}", pedido.getId());

		CaixaDiario caixa = caixaDiarioRepository.findByData(LocalDate.now())
				.orElseThrow(() -> new NegocioException("Caixa não encontrado"));

		// Incrementar total de pedidos
		caixa.setTotalPedidos(caixa.getTotalPedidos() + 1);

		// Atualizar total por método de pagamento
		if (pedido.getMetodoPagamento() != null) {
			switch (pedido.getMetodoPagamento()) {
			case DINHEIRO:
				caixa.setTotalDinheiro(caixa.getTotalDinheiro().add(pedido.getValorTotal()));
				break;
			case CARTAO_DEBITO:
				caixa.setTotalDebito(caixa.getTotalDebito().add(pedido.getValorTotal()));
				break;
			case CARTAO_CREDITO:
				caixa.setTotalCredito(caixa.getTotalCredito().add(pedido.getValorTotal()));
				break;
			case PIX:
				caixa.setTotalPix(caixa.getTotalPix().add(pedido.getValorTotal()));
				break;
			case FIADO:
				caixa.setTotalFiado(caixa.getTotalFiado().add(pedido.getValorTotal()));
				break;
			}
		}

		// Atualizar totais de concluídos
		caixa.setTotalConcluidos(caixa.getTotalConcluidos() + 1);
		caixa.setValorTotalConcluidos(caixa.getValorTotalConcluidos().add(pedido.getValorTotal()));

		caixaDiarioRepository.save(caixa);
		log.info("Totais do caixa atualizados com sucesso");
	}

	/**
	 * Atualizar totais do caixa quando um pedido é criado
	 */
	@Transactional(propagation = Propagation.REQUIRES_NEW) // ← NOVA TRANSAÇÃO
	public void atualizarTotaisNovoPedido(Pedido pedido) {
		try {
			log.info("Atualizando totais do caixa para novo pedido: {}", pedido.getId());

			CaixaDiario caixa = caixaDiarioRepository.findByData(LocalDate.now())
					.orElseThrow(() -> new NegocioException("Caixa não encontrado para hoje"));

			// Incrementar total de pedidos
			caixa.setTotalPedidos(caixa.getTotalPedidos() + 1);

			caixaDiarioRepository.save(caixa);
			log.info("Total de pedidos atualizado para: {}", caixa.getTotalPedidos());
		} catch (Exception e) {
			log.error("Erro ao atualizar totais do caixa: {}", e.getMessage());
			// Não propaga a exceção para não cancelar a criação do pedido
		}
	}

	/**
	 * Atualizar totais do caixa quando um pedido é pago
	 */
	public void atualizarTotaisPagamento(Pedido pedido) {
		log.info("Atualizando totais do caixa para pedido pago: {}", pedido.getId());

		CaixaDiario caixa = caixaDiarioRepository.findByData(LocalDate.now())
				.orElseThrow(() -> new NegocioException("Caixa não encontrado para hoje"));

		// Atualizar total por método de pagamento
		if (pedido.getMetodoPagamento() != null) {
			switch (pedido.getMetodoPagamento()) {
			case DINHEIRO:
				caixa.setTotalDinheiro(caixa.getTotalDinheiro().add(pedido.getValorTotal()));
				break;
			case CARTAO_DEBITO:
				caixa.setTotalDebito(caixa.getTotalDebito().add(pedido.getValorTotal()));
				break;
			case CARTAO_CREDITO:
				caixa.setTotalCredito(caixa.getTotalCredito().add(pedido.getValorTotal()));
				break;
			case PIX:
				caixa.setTotalPix(caixa.getTotalPix().add(pedido.getValorTotal()));
				break;
			case FIADO:
				caixa.setTotalFiado(caixa.getTotalFiado().add(pedido.getValorTotal()));
				break;
			default:
				log.warn("Método de pagamento não reconhecido: {}", pedido.getMetodoPagamento());
			}
		}

		// Atualizar totais de concluídos
		caixa.setTotalConcluidos(caixa.getTotalConcluidos() + 1);
		caixa.setValorTotalConcluidos(caixa.getValorTotalConcluidos().add(pedido.getValorTotal()));

		caixaDiarioRepository.save(caixa);
		log.info("Totais do caixa atualizados com sucesso");
		log.info("Total concluídos: {}, Valor total: {}", caixa.getTotalConcluidos(), caixa.getValorTotalConcluidos());
	}

	/**
	 * Atualizar totais quando um pedido é cancelado
	 */
	public void atualizarTotaisCancelamento(Pedido pedido) {
		log.info("Atualizando totais de cancelamento para pedido: {}", pedido.getId());

		CaixaDiario caixa = caixaDiarioRepository.findByData(LocalDate.now())
				.orElseThrow(() -> new NegocioException("Caixa não encontrado para hoje"));

		caixa.setTotalCancelados(caixa.getTotalCancelados() + 1);

		caixaDiarioRepository.save(caixa);
		log.info("Total de cancelamentos atualizado para: {}", caixa.getTotalCancelados());
	}

	/**
	 * Buscar totais do caixa hoje
	 */
	public Map<String, Object> getTotaisHoje() {
		CaixaDiario caixa = buscarCaixaHoje();

		Map<String, Object> totais = new HashMap<>();
		totais.put("totalPedidos", caixa.getTotalPedidos());
		totais.put("totalCancelados", caixa.getTotalCancelados());
		totais.put("totalConcluidos", caixa.getTotalConcluidos());
		totais.put("valorTotalConcluidos", caixa.getValorTotalConcluidos());
		totais.put("totalGeral", caixa.getTotalGeral());

		Map<String, BigDecimal> porMetodo = new HashMap<>();
		porMetodo.put("dinheiro", caixa.getTotalDinheiro());
		porMetodo.put("debito", caixa.getTotalDebito());
		porMetodo.put("credito", caixa.getTotalCredito());
		porMetodo.put("pix", caixa.getTotalPix());
		porMetodo.put("fiado", caixa.getTotalFiado());
		totais.put("porMetodo", porMetodo);

		return totais;
	}
}