package com.filacerta.application.mapper;

import org.springframework.stereotype.Component;

import com.filacerta.application.dto.response.CaixaDiarioResponse;
import com.filacerta.domain.entity.CaixaDiario;

@Component
public class CaixaMapper {

	public CaixaDiarioResponse toResponse(CaixaDiario caixa) {
		if (caixa == null) {
			return null;
		}

		return CaixaDiarioResponse.builder().id(caixa.getId()).data(caixa.getData())
				.horaAbertura(caixa.getHoraAbertura()).horaFechamento(caixa.getHoraFechamento())
				.horaPausa(caixa.getHoraPausa()).horaReativacao(caixa.getHoraReativacao())
				.motivoPausa(caixa.getMotivoPausa()).tempoEstimadoRetorno(caixa.getTempoEstimadoRetorno())
				.valorInicial(caixa.getValorInicial())
				.status(caixa.getStatus() != null ? caixa.getStatus().name() : null)
				.totalDinheiro(caixa.getTotalDinheiro()).totalDebito(caixa.getTotalDebito())
				.totalCredito(caixa.getTotalCredito()).totalPix(caixa.getTotalPix()).totalFiado(caixa.getTotalFiado())
				.totalGeral(caixa.getTotalGeral()).totalPedidos(caixa.getTotalPedidos())
				.totalCancelados(caixa.getTotalCancelados()).totalConcluidos(caixa.getTotalConcluidos())
				.valorTotalConcluidos(caixa.getValorTotalConcluidos()).createdAt(caixa.getCreatedAt()).build();
	}
}