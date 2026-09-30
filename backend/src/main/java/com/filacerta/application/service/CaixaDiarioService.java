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
        novoCaixa.setCozinhaPausada(false);

        CaixaDiarioResponse response = CaixaMapper.toResponse(caixaDiarioRepository.save(novoCaixa));
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
        
        ResumoFechamentoResponse response = calcularTotais(caixa, pedidosDoCaixa);
        response.setDataFechamento(caixa.getDataFechamento()); // Adiciona o dado extra de fechamento

        messagingTemplate.convertAndSend("/topic/caixa", "ATUALIZOU");

        return response;
    }

    @Transactional(readOnly = true)
    public ResumoFechamentoResponse obterResumoAtual(Long caixaId) {
        CaixaDiario caixa = caixaDiarioRepository.findById(caixaId)
                .orElseThrow(() -> new NegocioException("Caixa não encontrado."));

        List<Pedido> pedidosDoCaixa = pedidoRepository.findByCaixaDiarioId(caixa.getId());

        return calcularTotais(caixa, pedidosDoCaixa);
    }

    // --- MÉTODO PRIVADO PARA EVITAR CÓDIGO REPETIDO (USADO NO FECHAR E NO RESUMO ATUAL) ---
    private ResumoFechamentoResponse calcularTotais(CaixaDiario caixa, List<Pedido> pedidosDoCaixa) {
        BigDecimal totalPix = BigDecimal.ZERO;
        BigDecimal totalCartao = BigDecimal.ZERO;
        BigDecimal totalDinheiro = BigDecimal.ZERO;
        BigDecimal valorCancelado = BigDecimal.ZERO;

        int qtdPix = 0;
        int qtdCartao = 0;
        int qtdDinheiro = 0;
        int qtdCancelados = 0;

        for (Pedido p : pedidosDoCaixa) {
            
            // Soma e conta Cancelamentos
            if (p.getStatus() == StatusPedido.CANCELADO) {
                qtdCancelados++;
                if (p.getValorTotal() != null) {
                    valorCancelado = valorCancelado.add(p.getValorTotal());
                }
                continue; // Pula a contagem de pagamento se foi cancelado
            }
            
            // Soma e conta Pagamentos Bem-Sucedidos
            if (p.getStatusPagamento() == StatusPagamento.PAGO && p.getValorTotal() != null) {
                if (p.getFormaPagamento() == FormaPagamento.PIX) {
                    totalPix = totalPix.add(p.getValorTotal());
                    qtdPix++;
                } else if (p.getFormaPagamento() == FormaPagamento.CARTAO) {
                    totalCartao = totalCartao.add(p.getValorTotal());
                    qtdCartao++;
                } else if (p.getFormaPagamento() == FormaPagamento.DINHEIRO) {
                    totalDinheiro = totalDinheiro.add(p.getValorTotal());
                    qtdDinheiro++;
                }
            }
        }

        BigDecimal faturamentoTotal = totalPix.add(totalCartao).add(totalDinheiro);
        BigDecimal totalEmGaveta = caixa.getValorInicial().add(totalDinheiro);

        // Contadores Gerais
        int totalPedidos = pedidosDoCaixa.size();
        int totalConcluidos = (int) pedidosDoCaixa.stream()
                .filter(p -> p.getStatus() == StatusPedido.ENTREGUE || p.getStatus() == StatusPedido.SERVIDO)
                .count();

        return ResumoFechamentoResponse.builder()
                .caixaId(caixa.getId())
                .valorInicialTroco(caixa.getValorInicial())
                .totalPix(totalPix).qtdPix(qtdPix)
                .totalCartao(totalCartao).qtdCartao(qtdCartao)
                .totalDinheiro(totalDinheiro).qtdDinheiro(qtdDinheiro)
                .faturamentoTotal(faturamentoTotal)
                .totalEmGaveta(totalEmGaveta)
                .quantidadeCancelados(qtdCancelados)
                .valorCancelado(valorCancelado)
                .totalPedidos(totalPedidos)
                .totalCancelados(qtdCancelados) // Mesmo valor de quantidadeCancelados
                .totalConcluidos(totalConcluidos)
                .build();
    }

    @Transactional
    public CaixaDiarioResponse alternarPausaCozinha(Long caixaId) {
        CaixaDiario caixa = caixaDiarioRepository.findById(caixaId)
                .orElseThrow(() -> new NegocioException("Caixa não encontrado"));

        boolean novoStatus = caixa.getCozinhaPausada() == null ? true : !caixa.getCozinhaPausada();
        caixa.setCozinhaPausada(novoStatus);

        if (!novoStatus) {
            caixa.setMotivoPausa(null);
        }

        caixa = caixaDiarioRepository.save(caixa);
        messagingTemplate.convertAndSend("/topic/caixa", "ATUALIZOU");
        return CaixaMapper.toResponse(caixa);
    }
}