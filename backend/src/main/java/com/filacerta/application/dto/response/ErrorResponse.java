package com.filacerta.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String erro;
    private String mensagem;
    private LocalDateTime timestamp;
}