package com.filacerta.application.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.request.CriarComandaRequest;
import com.filacerta.application.dto.response.ComandaResponse;
import com.filacerta.application.mapper.ComandaMapper;
import com.filacerta.domain.entity.Comanda;
import com.filacerta.domain.entity.ComandaPedido;
import com.filacerta.domain.entity.Pedido;
import com.filacerta.domain.enums.StatusComanda;
import com.filacerta.domain.enums.StatusPagamento;
import com.filacerta.domain.enums.StatusPedido;
import com.filacerta.domain.exception.ComandaNaoEncontradaException;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.domain.exception.PedidoNaoEncontradoException;
import com.filacerta.infrastructure.repository.ComandaPedidoRepository;
import com.filacerta.infrastructure.repository.ComandaRepository;
import com.filacerta.infrastructure.repository.PedidoRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ComandaService {

	private final ComandaRepository comandaRepository;
	private final ComandaPedidoRepository comandaPedidoRepository;
	private final PedidoRepository pedidoRepository;
	private final ComandaMapper comandaMapper;

	private static final String PREFIXO_COMANDAS = "M";

	public ComandaResponse criarComanda(CriarComandaRequest request) {
		log.info("Criando comanda para cliente: {}", request.getNomeCliente());

		String codigo = gerarCodigoComanda();

		Comanda comanda = new Comanda();
		comanda.setCodigo(codigo);
		comanda.setNomeCliente(request.getNomeCliente());
		comanda.setMesa(request.getMesa());
		comanda.setStatus(StatusComanda.ABERTA);
		comanda.setValorTotal(BigDecimal.ZERO);
		comanda.setAbertura(LocalDateTime.now());

		comanda = comandaRepository.save(comanda);
		log.info("Comanda {} criada com sucesso", comanda.getCodigo());

		return comandaMapper.toResponse(comanda);
	}

	public ComandaResponse buscarComandaPorId(Long id) {
		log.info("Buscando comanda com ID: {}", id);
		Comanda comanda = comandaRepository.findById(id).orElseThrow(() -> new ComandaNaoEncontradaException(id));
		return comandaMapper.toResponse(comanda);
	}

	public ComandaResponse buscarComandaPorCodigo(String codigo) {
		log.info("Buscando comanda com código: {}", codigo);
		Comanda comanda = comandaRepository.findByCodigoAndStatus(codigo, StatusComanda.ABERTA)
				.orElseThrow(() -> new ComandaNaoEncontradaException(codigo));
		return comandaMapper.toResponse(comanda);
	}

	public List<ComandaResponse> listarComandasAbertas() {
		log.info("Listando comandas abertas");
		List<Comanda> comandas = comandaRepository.findByStatusOrderByAberturaAsc(StatusComanda.ABERTA);
		return comandaMapper.toResponseList(comandas);
	}

	public ComandaResponse fecharComanda(Long id) {
		log.info("Fechando comanda {}", id);
		Comanda comanda = comandaRepository.findById(id).orElseThrow(() -> new ComandaNaoEncontradaException(id));

		if (comanda.getStatus() == StatusComanda.FECHADA) {
			throw new NegocioException("Comanda já está fechada");
		}

		// Verificar se todos os pedidos estão pagos ou entregues
		List<ComandaPedido> comandaPedidos = comandaPedidoRepository.findByComandaIdOrderByCreatedAtAsc(id);

		if (comandaPedidos.isEmpty()) {
			throw new NegocioException("Não há pedidos na comanda para fechar");
		}

		for (ComandaPedido cp : comandaPedidos) {
			Pedido pedido = cp.getPedido();
			if (pedido.getStatusPagamento() != StatusPagamento.PAGO
					&& pedido.getStatusPagamento() != StatusPagamento.FIADO) {
				throw new NegocioException("Existem pedidos não pagos na comanda: #" + pedido.getNumero());
			}
			if (pedido.getStatus() != StatusPedido.ENTREGUE) {
				throw new NegocioException("Existem pedidos não entregues na comanda: #" + pedido.getNumero());
			}
		}

		comanda.setStatus(StatusComanda.FECHADA);
		comanda.setFechamento(LocalDateTime.now());

		// Atualizar valor total final
		BigDecimal total = comandaPedidos.stream().map(cp -> cp.getPedido().getValorTotal()).reduce(BigDecimal.ZERO,
				BigDecimal::add);
		comanda.setValorTotal(total);

		comanda = comandaRepository.save(comanda);
		log.info("Comanda {} fechada com sucesso", comanda.getCodigo());

		return comandaMapper.toResponse(comanda);
	}

	public ComandaResponse adicionarPedidoComanda(Long comandaId, Long pedidoId) {
		log.info("Adicionando pedido {} à comanda {}", pedidoId, comandaId);

		Comanda comanda = comandaRepository.findById(comandaId)
				.orElseThrow(() -> new ComandaNaoEncontradaException(comandaId));

		if (comanda.getStatus() == StatusComanda.FECHADA) {
			throw new NegocioException("Não é possível adicionar pedidos a uma comanda fechada");
		}

		Pedido pedido = pedidoRepository.findById(pedidoId)
				.orElseThrow(() -> new PedidoNaoEncontradoException(pedidoId));

		// Verificar se o pedido já está vinculado a outra comanda
		if (pedido.getComandaPedido() != null) {
			throw new NegocioException("Pedido #" + pedido.getNumero() + " já está vinculado a outra comanda");
		}

		// Verificar se o pedido é do tipo COMER_AQUI
		if (pedido.getTipo().name().equals("LEVAR")) {
			throw new NegocioException("Apenas pedidos do tipo COMER_AQUI podem ser vinculados a comandas");
		}

		ComandaPedido comandaPedido = new ComandaPedido();
		comandaPedido.setComanda(comanda);
		comandaPedido.setPedido(pedido);
		comandaPedido.setCreatedAt(LocalDateTime.now());

		comandaPedido = comandaPedidoRepository.save(comandaPedido);
		comanda.getComandaPedidos().add(comandaPedido);

		// Atualizar valor total da comanda
		recalcularValorTotal(comanda);

		comanda = comandaRepository.save(comanda);
		log.info("Pedido #{} adicionado à comanda {} com sucesso", pedido.getNumero(), comanda.getCodigo());

		return comandaMapper.toResponse(comanda);
	}

	// ===== MÉTODOS PRIVADOS =====

	private String gerarCodigoComanda() {
		List<Comanda> comandas = comandaRepository.findAll();

		int maxSequencial = 0;
		for (Comanda c : comandas) {
			String codigo = c.getCodigo();
			if (codigo.startsWith(PREFIXO_COMANDAS)) {
				try {
					int num = Integer.parseInt(codigo.substring(PREFIXO_COMANDAS.length()));
					if (num > maxSequencial) {
						maxSequencial = num;
					}
				} catch (NumberFormatException e) {
					// Ignorar
				}
			}
		}

		int novoNumero = maxSequencial + 1;
		return PREFIXO_COMANDAS + String.format("%04d", novoNumero);
	}

	private void recalcularValorTotal(Comanda comanda) {
		BigDecimal total = comanda.getComandaPedidos().stream().map(cp -> cp.getPedido().getValorTotal())
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		comanda.setValorTotal(total);
	}

	public ComandaResponse buscarComandaAbertaPorCliente(String nomeCliente) {
		log.info("Buscando comanda aberta para cliente: {}", nomeCliente);
		List<Comanda> comandas = comandaRepository.findByStatusOrderByAberturaAsc(StatusComanda.ABERTA);

		return comandas.stream().filter(c -> c.getNomeCliente().equalsIgnoreCase(nomeCliente)).findFirst()
				.map(comandaMapper::toResponse).orElse(null);
	}
}