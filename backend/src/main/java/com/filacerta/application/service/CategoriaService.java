package com.filacerta.application.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.request.CategoriaRequest;
import com.filacerta.application.dto.response.CategoriaResponse;
import com.filacerta.application.mapper.CategoriaMapper;
import com.filacerta.domain.entity.Categoria;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.infrastructure.repository.CategoriaRepository;

@Service
public class CategoriaService {
    
    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest request) {
        Categoria categoria = new Categoria();
        categoria.setNome(request.getNome());
        
        categoria = categoriaRepository.save(categoria);
        return toResponse(categoria);
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarTodas() {
        return categoriaRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private CategoriaResponse toResponse(Categoria categoria) {
        return CategoriaResponse.builder()
                .id(categoria.getId())
                .nome(categoria.getNome())
                .build();
    }
    
    @Transactional
	public CategoriaResponse atualizarCategoria(Long id, CategoriaRequest request) {
		Categoria categoria = categoriaRepository.findById(id)
				.orElseThrow(() -> new NegocioException("Categoria não encontrada."));

		categoria.setNome(request.getNome());
		// Se tiver outros campos na categoria (como descricao, icone), atualize-os aqui
		
		Categoria salva = categoriaRepository.save(categoria);
		return CategoriaMapper.toResponse(salva);
	}

	@Transactional
	public void excluirCategoria(Long id) {
		Categoria categoria = categoriaRepository.findById(id)
				.orElseThrow(() -> new NegocioException("Categoria não encontrada."));

		try {
			categoriaRepository.delete(categoria);
			categoriaRepository.flush(); // Força o envio imediato para o banco de dados
		} catch (DataIntegrityViolationException e) {
			throw new NegocioException("Não é possível excluir esta categoria porque existem produtos associados a ela.");
		}
	}
}