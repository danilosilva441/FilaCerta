package com.filacerta.application.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.infrastructure.repository.CaixaDiarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class CaixaDiarioService {

	private final CaixaDiarioRepository caixaDiarioRepository;

	public void abrirCaixa() {
		log.info("Abrindo caixa do dia");
		// TODO: Implementar lógica
	}

	public void fecharCaixa() {
		log.info("Fechando caixa do dia");
		// TODO: Implementar lógica
	}

	public Object buscarCaixaDoDia() {
		log.info("Buscando caixa do dia: {}", LocalDate.now());
		// TODO: Implementar lógica
		return null;
	}

	public Object buscarCaixaPorData(LocalDate data) {
		log.info("Buscando caixa da data: {}", data);
		// TODO: Implementar lógica
		return null;
	}
}