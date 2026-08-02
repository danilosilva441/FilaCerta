package com.filacerta.presentation.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.response.CaixaDiarioResponse;
import com.filacerta.application.dto.response.StatusCaixaResponse;
import com.filacerta.application.mapper.CaixaMapper;
import com.filacerta.application.service.CaixaDiarioService;
import com.filacerta.domain.entity.CaixaDiario;
import com.filacerta.domain.exception.CaixaNaoEncontradoException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/caixa")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Caixa", description = "API para gerenciamento de caixa diário")
public class CaixaController {

    private final CaixaDiarioService caixaDiarioService;
    private final CaixaMapper caixaMapper;

    // ===== CAIXA =====
    
    @PostMapping("/abrir")
    @Operation(summary = "Abrir caixa do dia")
    public ResponseEntity<?> abrirCaixa() {
        try {
            caixaDiarioService.abrirCaixa();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "✅ Caixa aberto com sucesso!"
            ));
        } catch (Exception e) {
            log.error("Erro ao abrir caixa: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/fechar")
    @Operation(summary = "Fechar caixa do dia")
    public ResponseEntity<?> fecharCaixa() {
        try {
            caixaDiarioService.fecharCaixa();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "✅ Caixa fechado com sucesso!"
            ));
        } catch (Exception e) {
            log.error("Erro ao fechar caixa: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // ===== PAUSA =====
    
    @PostMapping("/pausar")
    @Operation(summary = "Pausar atendimento com motivo")
    public ResponseEntity<?> pausarAtendimento(@RequestBody Map<String, String> request) {
        try {
            String motivo = request != null ? request.get("motivo") : null;
            String tempo = request != null ? request.get("tempoEstimado") : null;
            
            caixaDiarioService.pausarAtendimento(motivo, tempo);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "⏸️ Atendimento pausado");
            if (motivo != null) {
                response.put("motivo", motivo);
            }
            if (tempo != null) {
                response.put("tempoEstimado", tempo);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erro ao pausar atendimento: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/reativar")
    @Operation(summary = "Reativar atendimento após pausa")
    public ResponseEntity<?> reativarAtendimento() {
        try {
            caixaDiarioService.reativarAtendimento();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "▶️ Atendimento reativado!"
            ));
        } catch (Exception e) {
            log.error("Erro ao reativar atendimento: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // ===== CONSULTAS =====
    
    @GetMapping("/hoje")
    @Operation(summary = "Buscar caixa do dia atual")
    public ResponseEntity<CaixaDiarioResponse> buscarCaixaHoje() {
        try {
            CaixaDiario caixa = caixaDiarioService.buscarCaixaHoje();
            CaixaDiarioResponse response = caixaMapper.toResponse(caixa);
            return ResponseEntity.ok(response);
        } catch (CaixaNaoEncontradoException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/hoje/status")
    @Operation(summary = "Verificar status do caixa hoje com mensagens personalizadas")
    public ResponseEntity<StatusCaixaResponse> verificarStatus() {
        StatusCaixaResponse response = new StatusCaixaResponse();
        
        if (caixaDiarioService.existeCaixaAberto()) {
            response.setStatus("ABERTO");
            response.setMensagem("🟢 Atendendo normalmente!");
            response.setMensagemDetalhada("Faça seu pedido.");
            response.setIcone("🟢");
            response.setPodePedir(true);
            
        } else if (caixaDiarioService.existeCaixaPausado()) {
            CaixaDiario caixa = caixaDiarioService.buscarCaixaHoje();
            response.setStatus("PAUSADO");
            response.setPodePedir(false);
            response.setHoraPausa(caixa.getHoraPausa());
            response.setMotivoPausa(caixa.getMotivoPausa());
            
            String motivo = caixa.getMotivoPausa() != null ? caixa.getMotivoPausa().toLowerCase() : "";
            String tempo = caixa.getTempoEstimadoRetorno() != null ? caixa.getTempoEstimadoRetorno() : "alguns minutos";
            
            if (motivo.contains("almoco") || motivo.contains("almoço")) {
                response.setMensagem("⏸️ Pausa para almoço");
                response.setMensagemDetalhada("Voltamos em " + tempo + "!");
                response.setIcone("🍽️");
            } else if (motivo.contains("manutencao") || motivo.contains("manutenção")) {
                response.setMensagem("⏸️ Pausa para manutenção");
                response.setMensagemDetalhada("Voltamos em " + tempo + "!");
                response.setIcone("🔧");
            } else {
                response.setMensagem("⏸️ Pausa rápida");
                response.setMensagemDetalhada("Voltamos em " + tempo + "!");
                response.setIcone("⏸️");
            }
            response.setTempoEstimado(tempo);
            
        } else if (caixaDiarioService.existeCaixaFechado()) {
            response.setStatus("FECHADO");
            response.setMensagem("🔒 Estabelecimento Fechado");
            response.setMensagemDetalhada("Volte amanhã!");
            response.setIcone("🔒");
            response.setPodePedir(false);
            
        } else {
            response.setStatus("NAO_ABERTO");
            response.setMensagem("📭 Aguardando abertura");
            response.setMensagemDetalhada("O estabelecimento ainda não abriu.");
            response.setIcone("📭");
            response.setPodePedir(false);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/hoje/totais")
    @Operation(summary = "Totais do caixa hoje")
    public ResponseEntity<Map<String, Object>> totaisCaixaHoje() {
        try {
            CaixaDiario caixa = caixaDiarioService.buscarCaixaHoje();
            
            Map<String, Object> totais = new HashMap<>();
            totais.put("totalPedidos", caixa.getTotalPedidos());
            totais.put("totalCancelados", caixa.getTotalCancelados());
            totais.put("totalConcluidos", caixa.getTotalConcluidos());
            totais.put("valorTotalConcluidos", caixa.getValorTotalConcluidos());
            totais.put("totalGeral", caixa.getTotalGeral());
            
            Map<String, Object> porMetodo = new HashMap<>();
            porMetodo.put("dinheiro", caixa.getTotalDinheiro());
            porMetodo.put("debito", caixa.getTotalDebito());
            porMetodo.put("credito", caixa.getTotalCredito());
            porMetodo.put("pix", caixa.getTotalPix());
            porMetodo.put("fiado", caixa.getTotalFiado());
            totais.put("porMetodo", porMetodo);
            
            return ResponseEntity.ok(totais);
        } catch (CaixaNaoEncontradoException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{data}")
    @Operation(summary = "Buscar caixa por data")
    public ResponseEntity<CaixaDiarioResponse> buscarCaixaPorData(@PathVariable String data) {
        try {
            LocalDate date = LocalDate.parse(data);
            CaixaDiario caixa = caixaDiarioService.buscarCaixaPorData(date);
            CaixaDiarioResponse response = caixaMapper.toResponse(caixa);
            return ResponseEntity.ok(response);
        } catch (CaixaNaoEncontradoException e) {
            return ResponseEntity.notFound().build();
        }
    }
}