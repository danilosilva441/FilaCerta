package com.filacerta.application.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.response.CaixaDiarioResponse;
import com.filacerta.application.dto.response.ResumoFechamentoResponse;
import com.filacerta.domain.entity.CaixaDiario;
import com.filacerta.domain.entity.Pedido;
import com.filacerta.domain.enums.FormaPagamento;
import com.filacerta.domain.enums.StatusCaixa;
import com.filacerta.domain.enums.StatusPagamento;
import com.filacerta.domain.enums.StatusPedido;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.infrastructure.repository.CaixaDiarioRepository;
import com.filacerta.infrastructure.repository.PedidoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CaixaDiarioService {

	private final CaixaDiarioRepository caixaDiarioRepository;
	private final PedidoRepository pedidoRepository;
	

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
    public ResumoFechamentoResponse fecharCaixa(Long caixaId) {
        CaixaDiario caixa = caixaDiarioRepository.findById(caixaId)
                .orElseThrow(() -> new NegocioException("Caixa não encontrado."));

        if (caixa.getStatus() == StatusCaixa.FECHADO) {
            throw new NegocioException("Este caixa já está fechado.");
        }

        caixa.setStatus(StatusCaixa.FECHADO);
        caixa.setDataFechamento(LocalDateTime.now());
        caixaDiarioRepository.save(caixa);

        // Busca todos os pedidos atrelados a este caixa
        List<Pedido> pedidosDoCaixa = pedidoRepository.findByCaixaDiarioId(caixa.getId());

        BigDecimal totalPix = BigDecimal.ZERO;
        BigDecimal totalCartao = BigDecimal.ZERO;
        BigDecimal totalDinheiro = BigDecimal.ZERO;

        // Soma apenas os pedidos que foram PAGOS
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

        return ResumoFechamentoResponse.builder()
                .caixaId(caixa.getId())
                .dataFechamento(caixa.getDataFechamento())
                .valorInicialTroco(caixa.getValorInicial())
                .totalPix(totalPix)
                .totalCartao(totalCartao)
                .totalDinheiro(totalDinheiro)
                .faturamentoTotal(faturamentoTotal)
                .totalEmGaveta(totalEmGaveta)
                .build();
    }

	private CaixaDiarioResponse toResponse(CaixaDiario caixa) {
		return CaixaDiarioResponse.builder()
				.id(caixa.getId())
				.data(caixa.getData())
				.horaAbertura(caixa.getHoraAbertura())
				.horaFechamento(caixa.getHoraFechamento())
				.valorInicial(caixa.getValorInicial())
				.totalDinheiro(caixa.getTotalDinheiro())
				.totalPedidos(caixa.getTotalPedidos())
				.status(caixa.getStatus())
				.cozinhaPausada(caixa.getCozinhaPausada())
				.build();
	}
	
	@Transactional(readOnly = true)
    public ResumoFechamentoResponse obterResumoAtual(Long caixaId) {
        CaixaDiario caixa = caixaDiarioRepository.findById(caixaId)
                .orElseThrow(() -> new NegocioException("Caixa não encontrado."));

        // Busca todos os pedidos atrelados a este caixa
        List<Pedido> pedidosDoCaixa = pedidoRepository.findByCaixaDiarioId(caixa.getId());

        BigDecimal totalPix = BigDecimal.ZERO;
        BigDecimal totalCartao = BigDecimal.ZERO;
        BigDecimal totalDinheiro = BigDecimal.ZERO;
        int qtdPedidosConcluidos = 0;
        int qtdPedidosCancelados = 0;
        


        for (Pedido p : pedidosDoCaixa) {
            // Contagem de status (Você pode ter um enum CANCELADO no futuro)
            if (p.getStatus() == StatusPedido.PRONTO || p.getStatus() == StatusPedido.ENTREGUE) {
                qtdPedidosConcluidos++;
            }
            
            // Soma financeira
            if (p.getStatusPagamento() == StatusPagamento.PAGO && p.getValorTotal() != null) {
                if (p.getFormaPagamento() == FormaPagamento.PIX) totalPix = totalPix.add(p.getValorTotal());
                else if (p.getFormaPagamento() == FormaPagamento.CARTAO) totalCartao = totalCartao.add(p.getValorTotal());
                else if (p.getFormaPagamento() == FormaPagamento.DINHEIRO) totalDinheiro = totalDinheiro.add(p.getValorTotal());
            }
        }

        BigDecimal faturamentoTotal = totalPix.add(totalCartao).add(totalDinheiro);
        BigDecimal totalEmGaveta = caixa.getValorInicial().add(totalDinheiro);

        return ResumoFechamentoResponse.builder()
                .caixaId(caixa.getId())
                .valorInicialTroco(caixa.getValorInicial())
                .totalPix(totalPix)
                .totalCartao(totalCartao)
                .totalDinheiro(totalDinheiro)
                .faturamentoTotal(faturamentoTotal)
                .totalEmGaveta(totalEmGaveta)
                // Se quiser, no futuro pode adicionar qtdPedidosConcluidos no DTO!
                .build();
        
        
    }
	
	@Transactional
    public CaixaDiarioResponse alternarPausaCozinha(Long caixaId) {
        CaixaDiario caixa = caixaDiarioRepository.findById(caixaId)
                .orElseThrow(() -> new NegocioException("Caixa não encontrado"));
        
        caixa.setCozinhaPausada(!caixa.getCozinhaPausada());
        caixa = caixaDiarioRepository.save(caixa);
        
        // Agora sim, passando os dados completos!
        return CaixaDiarioResponse.builder()
                .id(caixa.getId())
                .data(caixa.getData())
                .horaAbertura(caixa.getHoraAbertura())
                .horaFechamento(caixa.getHoraFechamento())
                .valorInicial(caixa.getValorInicial())
                .totalDinheiro(caixa.getTotalDinheiro())
                .totalPedidos(caixa.getTotalPedidos())
                .status(caixa.getStatus())
                .cozinhaPausada(caixa.getCozinhaPausada())
                .build();
    }
}