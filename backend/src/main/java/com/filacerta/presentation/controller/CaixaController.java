package com.filacerta.presentation.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.request.AbrirCaixaRequest;
import com.filacerta.application.dto.request.AtualizarPagamentoRequest;
import com.filacerta.application.dto.response.CaixaDiarioResponse;
import com.filacerta.application.dto.response.PedidoResponse;
import com.filacerta.application.dto.response.ResumoFechamentoResponse;
import com.filacerta.application.service.CaixaDiarioService;
import com.filacerta.application.service.PedidoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/caixa")
@Tag(name = "Caixa", description = "Operações do caixa, balcão e pagamentos")
@RequiredArgsConstructor
public class CaixaController {

    private final CaixaDiarioService caixaDiarioService;
    private final PedidoService pedidoService;

    // ==========================================
    // OPERAÇÕES DO CAIXA DIÁRIO (Abertura/Fechamento/Dashboard)
    // ==========================================

    @GetMapping("/atual")
    @Operation(summary = "Buscar o status do caixa atual")
    public ResponseEntity<CaixaDiarioResponse> buscarCaixaAtual() {
        CaixaDiarioResponse response = caixaDiarioService.buscarCaixaAtual();
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.noContent().build();
    }

    @PostMapping("/abrir")
    @Operation(summary = "Abrir um novo caixa")
    public ResponseEntity<CaixaDiarioResponse> abrirCaixa(@RequestBody @Valid AbrirCaixaRequest request) {
        return ResponseEntity.ok(caixaDiarioService.abrirCaixa(request.getValorInicial()));
    }

    @PostMapping("/{id}/fechar")
    @Operation(summary = "Fechar o caixa atual")
    public ResponseEntity<ResumoFechamentoResponse> fecharCaixa(@PathVariable Long id) {
        ResumoFechamentoResponse resumo = caixaDiarioService.fecharCaixa(id);
        return ResponseEntity.ok(resumo);
    }

    @GetMapping("/{id}/resumo-atual")
    @Operation(summary = "Obter resumo financeiro atualizado (Dashboard) sem fechar o caixa")
    public ResponseEntity<ResumoFechamentoResponse> obterResumoAtual(@PathVariable Long id) {
        ResumoFechamentoResponse resumo = caixaDiarioService.obterResumoAtual(id);
        return ResponseEntity.ok(resumo);
    }

    // ==========================================
    // OPERAÇÕES DE PEDIDOS E PAGAMENTOS NO BALCÃO
    // ==========================================

    @GetMapping("/pagamentos-pendentes")
    @Operation(summary = "Listar pedidos aguardando pagamento")
    public ResponseEntity<List<PedidoResponse>> listarPendentes() {
        return ResponseEntity.ok(pedidoService.listarPedidoPagamentoPendente());
    }

    @PatchMapping("/pedidos/{id}/pagamento")
    @Operation(summary = "Atualizar status de pagamento do pedido")
    public ResponseEntity<Void> atualizarPagamento(@PathVariable Long id,
            @RequestBody @Valid AtualizarPagamentoRequest request) {
        pedidoService.atualizarStatusPagamento(id, request.getStatusPagamento());
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/pedidos/{id}/entregar")
    @Operation(summary = "Marca o pedido como entregue e o pagamento como recebido")
    public ResponseEntity<Void> finalizarEntrega(@PathVariable Long id) {
        pedidoService.finalizarEntrega(id);
        return ResponseEntity.ok().build();
    }
}