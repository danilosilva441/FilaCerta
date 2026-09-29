package com.filacerta.application.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.response.CaixaDiarioResponse;
import com.filacerta.application.dto.response.ResumoFechamentoResponse;
import com.filacerta.application.mapper.CaixaMapper;
import com.filacerta.domain.entity.CaixaDiario;
import com.filacerta.domain.entity.Pedido;
import com.filacerta.domain.enums.FormaPagamento;
import com.filacerta.domain.enums.StatusCaixa;
import com.filacerta.domain.enums.StatusPagamento;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.infrastructure.repository.CaixaDiarioRepository;
import com.filacerta.infrastructure.repository.PedidoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CaixaDiarioService {

	private final CaixaDiarioRepository caixaDiarioRepository;
	private final PedidoRepository pedidoRepository;
	private final SimpMessagingTemplate messagingTemplate;

	@Transactional(readOnly = true)
	public CaixaDiario buscarCaixaAberto() {
		return caixaDiarioRepository.findByStatus(StatusCaixa.ABERTO).orElseThrow(
				() -> new NegocioException("Não é possível realizar pedidos: Nenhum caixa aberto no momento."));
	}

	@Transactional(readOnly = true)
	public CaixaDiarioResponse buscarCaixaAtual() {
		return caixaDiarioRepository.findByStatus(StatusCaixa.ABERTO).map(CaixaMapper::toResponse).orElse(null);
	}

	@Transactional
	public CaixaDiarioResponse abrirCaixa(BigDecimal valorInicial) {
		LocalDate hoje = LocalDate.now();

		CaixaDiario caixaExistente = caixaDiarioRepository.findAll().stream().filter(c -> c.getData().equals(hoje))
				.findFirst().orElse(null);

		if (caixaExistente != null) {
			if (StatusCaixa.ABERTO.equals(caixaExistente.getStatus())) {
				throw new NegocioException("Já existe um caixa aberto para hoje.");
			}
			caixaExistente.setStatus(StatusCaixa.ABERTO);
			caixaExistente.setHoraAbertura(LocalDateTime.now());
			caixaExistente.setHoraFechamento(null);
			caixaExistente.setValorInicial(valorInicial);
			return CaixaMapper.toResponse(caixaDiarioRepository.save(caixaExistente));
		}

		CaixaDiario novoCaixa = new CaixaDiario();
		novoCaixa.setData(hoje);
		novoCaixa.setHoraAbertura(LocalDateTime.now());
		novoCaixa.setValorInicial(valorInicial);
		novoCaixa.setTotalDinheiro(BigDecimal.ZERO);
		novoCaixa.setTotalPedidos(0);
		novoCaixa.setStatus(StatusCaixa.ABERTO);
		// Garante que nasce despausada
		novoCaixa.setCozinhaPausada(false);

		CaixaDiarioResponse response = CaixaMapper.toResponse(caixaDiarioRepository.save(novoCaixa));
		
		// AVISA O ANGULAR: "A loja abriu!"
        messagingTemplate.convertAndSend("/topic/caixa", "ATUALIZOU");
        
        return response;
    
	}

	@Transactional
	public ResumoFechamentoResponse fecharCaixa(Long caixaId) {
		CaixaDiario caixa = caixaDiarioRepository.findById(caixaId)
				.orElseThrow(() -> new NegocioException("Caixa não encontrado."));

		if (caixa.getStatus() == StatusCaixa.FECHADO) {
			throw new NegocioException("Este caixa já está fechado.");
		}

		caixa.setStatus(StatusCaixa.FECHADO);
		caixa.setDataFechamento(LocalDateTime.now());
		caixaDiarioRepository.save(caixa);

		List<Pedido> pedidosDoCaixa = pedidoRepository.findByCaixaDiarioId(caixa.getId());

		BigDecimal totalPix = BigDecimal.ZERO;
		BigDecimal totalCartao = BigDecimal.ZERO;
		BigDecimal totalDinheiro = BigDecimal.ZERO;

		for (Pedido p : pedidosDoCaixa) {
			if (p.getStatusPagamento() == StatusPagamento.PAGO && p.getValorTotal() != null) {
				if (p.getFormaPagamento() == FormaPagamento.PIX) {
					totalPix = totalPix.add(p.getValorTotal());
				} else if (p.getFormaPagamento() == FormaPagamento.CARTAO) {
					totalCartao = totalCartao.add(p.getValorTotal());
				} else if (p.getFormaPagamento() == FormaPagamento.DINHEIRO) {
					totalDinheiro = totalDinheiro.add(p.getValorTotal());
				}
			}
		}

		BigDecimal faturamentoTotal = totalPix.add(totalCartao).add(totalDinheiro);
		BigDecimal totalEmGaveta = caixa.getValorInicial().add(totalDinheiro);

		ResumoFechamentoResponse response = ResumoFechamentoResponse.builder()
				.caixaId(caixa.getId())
				.dataFechamento(caixa.getDataFechamento())
				.valorInicialTroco(caixa.getValorInicial())
				.totalPix(totalPix)
				.totalCartao(totalCartao)
				.totalDinheiro(totalDinheiro)
				.faturamentoTotal(faturamentoTotal)
				.totalEmGaveta(totalEmGaveta)
				.build();

		messagingTemplate.convertAndSend("/topic/caixa", "ATUALIZOU");

		return response;
	}

	@Transactional(readOnly = true)
	public ResumoFechamentoResponse obterResumoAtual(Long caixaId) {
		CaixaDiario caixa = caixaDiarioRepository.findById(caixaId)
				.orElseThrow(() -> new NegocioException("Caixa não encontrado."));

		List<Pedido> pedidosDoCaixa = pedidoRepository.findByCaixaDiarioId(caixa.getId());

		BigDecimal totalPix = BigDecimal.ZERO;
		BigDecimal totalCartao = BigDecimal.ZERO;
		BigDecimal totalDinheiro = BigDecimal.ZERO;

		for (Pedido p : pedidosDoCaixa) {
			if (p.getStatusPagamento() == StatusPagamento.PAGO && p.getValorTotal() != null) {
				if (p.getFormaPagamento() == FormaPagamento.PIX)
					totalPix = totalPix.add(p.getValorTotal());
				else if (p.getFormaPagamento() == FormaPagamento.CARTAO)
					totalCartao = totalCartao.add(p.getValorTotal());
				else if (p.getFormaPagamento() == FormaPagamento.DINHEIRO)
					totalDinheiro = totalDinheiro.add(p.getValorTotal());
			}
		}

		BigDecimal faturamentoTotal = totalPix.add(totalCartao).add(totalDinheiro);
		BigDecimal totalEmGaveta = caixa.getValorInicial().add(totalDinheiro);

		return ResumoFechamentoResponse.builder().caixaId(caixa.getId()).valorInicialTroco(caixa.getValorInicial())
				.totalPix(totalPix).totalCartao(totalCartao).totalDinheiro(totalDinheiro)
				.faturamentoTotal(faturamentoTotal).totalEmGaveta(totalEmGaveta).build();
	}

	// ---MÉTODO: Funciona como um Interruptor (LIGA/DESLIGA) ---
	@Transactional
	public CaixaDiarioResponse alternarPausaCozinha(Long caixaId) {
		CaixaDiario caixa = caixaDiarioRepository.findById(caixaId)
				.orElseThrow(() -> new NegocioException("Caixa não encontrado"));

		// Se estiver null ou false, vira true. Se estiver true, vira false.
		boolean novoStatus = caixa.getCozinhaPausada() == null ? true : !caixa.getCozinhaPausada();
		caixa.setCozinhaPausada(novoStatus);

		// Limpa o motivo caso esteja retomando os pedidos
		if (!novoStatus) {
			caixa.setMotivoPausa(null);
		}

		caixa = caixaDiarioRepository.save(caixa);

		// AVISA O ANGULAR: "A cozinha pausou/voltou!"
		messagingTemplate.convertAndSend("/topic/caixa", "ATUALIZOU");

		return CaixaMapper.toResponse(caixa);
	}
}