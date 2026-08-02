package com.filacerta.presentation.handler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.filacerta.application.dto.response.ErrorResponse;
import com.filacerta.domain.exception.CaixaFechadoException;
import com.filacerta.domain.exception.CaixaNaoEncontradoException;
import com.filacerta.domain.exception.ComandaNaoEncontradaException;
import com.filacerta.domain.exception.ItemNaoEncontradoException;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.domain.exception.PedidoNaoEncontradoException;
import com.filacerta.domain.exception.ProdutoNaoEncontradoException;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<ErrorResponse> handleNegocioException(NegocioException ex, HttpServletRequest request) {
        log.error("Erro de negócio: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Erro de Negócio",
            ex.getMessage(),
            LocalDateTime.now(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(PedidoNaoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handlePedidoNaoEncontrado(PedidoNaoEncontradoException ex, HttpServletRequest request) {
        log.error("Pedido não encontrado: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Pedido não encontrado",
            ex.getMessage(),
            LocalDateTime.now(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ComandaNaoEncontradaException.class)
    public ResponseEntity<ErrorResponse> handleComandaNaoEncontrada(ComandaNaoEncontradaException ex, HttpServletRequest request) {
        log.error("Comanda não encontrada: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Comanda não encontrada",
            ex.getMessage(),
            LocalDateTime.now(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ProdutoNaoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleProdutoNaoEncontrado(ProdutoNaoEncontradoException ex, HttpServletRequest request) {
        log.error("Produto não encontrado: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Produto não encontrado",
            ex.getMessage(),
            LocalDateTime.now(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(CaixaNaoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleCaixaNaoEncontrado(CaixaNaoEncontradoException ex, HttpServletRequest request) {
        log.warn("Caixa não encontrado: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Caixa não encontrado",
            ex.getMessage(),
            LocalDateTime.now(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ItemNaoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleItemNaoEncontrado(ItemNaoEncontradoException ex, HttpServletRequest request) {
        log.error("Item não encontrado: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Item não encontrado",
            ex.getMessage(),
            LocalDateTime.now(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        log.error("Erro de validação: {}", errors);
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Erro de Validação",
            errors.toString(),
            LocalDateTime.now(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Erro inesperado: ", ex);
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Erro Interno do Servidor",
            "Ocorreu um erro inesperado. Tente novamente mais tarde.",
            LocalDateTime.now(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    /**
     * Handler específico para CaixaFechadoException
     * Retorna 400 Bad Request com mensagem clara
     */
    @ExceptionHandler(CaixaFechadoException.class)
    public ResponseEntity<ErrorResponse> handleCaixaFechado(CaixaFechadoException ex, HttpServletRequest request) {
        log.warn("Tentativa de criar pedido com caixa fechado: {}", ex.getMessage());
        
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Estabelecimento Fechado",  // ← Título mais amigável
            ex.getMessage(),
            LocalDateTime.now(),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}