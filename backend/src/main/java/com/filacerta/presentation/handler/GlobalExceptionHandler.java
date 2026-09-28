package com.filacerta.presentation.handler;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.filacerta.application.dto.response.ErrorResponse;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.domain.exception.ProdutoNaoEncontradoException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	
	private static final long serialVersionUID = 1L;

	// Trata o erro 404 quando um produto não existe
	@ExceptionHandler(ProdutoNaoEncontradoException.class)
	public ResponseEntity<ErrorResponse> handleProdutoNaoEncontrado(ProdutoNaoEncontradoException ex) {
		ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), "Não Encontrado", ex.getMessage(),
				LocalDateTime.now());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
	}

	// Trata erros de regra de negócio (Ex: Tentar pedir com o caixa fechado)
	@ExceptionHandler(NegocioException.class)
	public ResponseEntity<ErrorResponse> handleNegocioException(NegocioException ex) {
		ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Erro de Regra de Negócio",
				ex.getMessage(), LocalDateTime.now());
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
	}

	// Trata erros de validação das anotações @Valid, @NotNull, @NotBlank, etc.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        
        // Pega APENAS a mensagem amigável (DefaultMessage), sem o nome do campo técnico
        String mensagemErro = ex.getBindingResult().getAllErrors().stream()
                .map(error -> error.getDefaultMessage()) 
                .collect(Collectors.joining(" | ")); // Separa com " | " caso existam múltiplos erros simultâneos

        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(), 
                "Atenção", // Trocando o título para algo menos técnico que "Erro de Validação"
                mensagemErro,
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

	// Fallback genérico para qualquer outro erro inesperado (Evita estourar a
	// stacktrace pro cliente)
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
		// Imprime o erro real no terminal do Fedora para podermos debugar!
		ex.printStackTrace();

		ErrorResponse error = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Erro Interno do Servidor",
				"Ocorreu um erro inesperado. Tente novamente mais tarde.", LocalDateTime.now());
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

}