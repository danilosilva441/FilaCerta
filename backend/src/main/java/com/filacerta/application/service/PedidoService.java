package com.filacerta.application.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.request.AtualizarItemRequest;
import com.filacerta.application.dto.request.AtualizarPedidoRequest;
import com.filacerta.application.dto.request.CriarPedidoRequest;
import com.filacerta.application.dto.request.RegistrarPagamentoRequest;
import com.filacerta.application.dto.response.FilaCozinhaResponse;
import com.filacerta.application.dto.response.PedidoResponse;
import com.filacerta.application.mapper.PedidoMapper;
import com.filacerta.domain.entity.Cliente;
import com.filacerta.domain.entity.Comanda;
import com.filacerta.domain.entity.ComandaPedido;
import com.filacerta.domain.entity.ItemPedido;
import com.filacerta.domain.entity.Pedido;
import com.filacerta.domain.entity.Produto;
import com.filacerta.domain.enums.StatusComanda;
import com.filacerta.domain.enums.StatusItemPedido;
import com.filacerta.domain.enums.StatusPagamento;
import com.filacerta.domain.enums.StatusPedido;
import com.filacerta.domain.exception.ItemNaoEncontradoException;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.domain.exception.PedidoNaoEncontradoException;
import com.filacerta.domain.exception.ProdutoNaoEncontradoException;
import com.filacerta.infrastructure.repository.ComandaPedidoRepository;
import com.filacerta.infrastructure.repository.ComandaRepository;
import com.filacerta.infrastructure.repository.ItemPedidoRepository;
import com.filacerta.infrastructure.repository.PedidoRepository;
import com.filacerta.infrastructure.repository.ProdutoRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class PedidoService {

	private final AuthService authService;
	private final PedidoRepository pedidoRepository;
	private final ProdutoRepository produtoRepository;
	private final ItemPedidoRepository itemPedidoRepository;
	private final ComandaRepository comandaRepository;
	private final ComandaPedidoRepository comandaPedidoRepository;
	private final PedidoMapper pedidoMapper;
	private final CaixaDiarioService caixaDiarioService;

	public PedidoResponse criarPedido(CriarPedidoRequest request, String token) {
		log.info("Criando novo pedido para cliente: {}", request.getNomeCliente());

		// Validar caixa
		caixaDiarioService.validarCaixaAtendendo();

		// Gerar número do pedido
		Integer numero = gerarNumeroPedido();

		// Criar pedido
		Pedido pedido = new Pedido();
		pedido.setNumero(numero);
		pedido.setNomeCliente(request.getNomeCliente());
		pedido.setTipo(request.getTipo());
		pedido.setOrigem(
				request.getOrigem() != null ? request.getOrigem() : com.filacerta.domain.enums.OrigemPedido.MANUAL);
		pedido.setStatus(StatusPedido.RECEBIDO);
		pedido.setStatusPagamento(StatusPagamento.AGUARDANDO);
		pedido.setObservacao(request.getObservacao());
		pedido.setDataHoraPedido(LocalDateTime.now());
		pedido.setCaixaDiarioData(LocalDate.now());
		pedido.setValorTotal(BigDecimal.ZERO);

		// Salvar pedido para ter ID
		pedido = pedidoRepository.save(pedido);

		// ⚠️ VINCULAR CLIENTE - Tratar erro sem rollback
		vincularClienteSemRollback(pedido, token);

		// Adicionar itens
		for (CriarPedidoRequest.ItemPedidoRequest itemRequest : request.getItens()) {
			Produto produto = produtoRepository.findById(itemRequest.getProdutoId())
					.orElseThrow(() -> new ProdutoNaoEncontradoException(itemRequest.getProdutoId()));

			ItemPedido item = new ItemPedido();
			item.setPedido(pedido);
			item.setProduto(produto);
			item.setQuantidade(itemRequest.getQuantidade());
			item.setPrecoUnitario(produto.getPreco());
			item.setStatus(StatusItemPedido.PENDENTE);
			item.setObservacaoItem(itemRequest.getObservacao());

			pedido.getItens().add(item);
		}

		// Recalcular valor total
		recalcularValorTotal(pedido);

		// Salvar novamente com os itens
		pedido = pedidoRepository.save(pedido);

		// Vincular comanda automaticamente
		vincularComandaAutomaticamente(pedido);

		// Atualizar totais do caixa
		try {
			caixaDiarioService.atualizarTotaisNovoPedido(pedido);
		} catch (Exception e) {
			log.error("Erro ao atualizar totais do caixa: {}", e.getMessage());
		}

		log.info("Pedido {} criado com sucesso", pedido.getNumero());
		return pedidoMapper.toResponse(pedido);
	}

	/**
	 * Vincula o cliente ao pedido se o token for válido NUNCA lança exceção para
	 * não quebrar a transação
	 */
	private void vincularClienteSemRollback(Pedido pedido, String token) {
		if (token == null || token.isEmpty()) {
			log.info("Token não fornecido, usando nome informado: {}", pedido.getNomeCliente());
			return;
		}

		try {
			Cliente cliente = authService.getClienteByToken(token);
			if (cliente != null) {
				pedido.setNomeCliente(cliente.getNomeCompleto());
				vincularComandaCliente(pedido, cliente);
				log.info("Cliente vinculado com sucesso: {}", cliente.getNomeCompleto());
			}
		} catch (Exception e) {
			log.warn("Erro ao vincular cliente: {}", e.getMessage());
			// 🔥 Não fazemos nada, apenas logamos o erro
			// O pedido continua com o nome informado na requisição
		}
	}

	public PedidoResponse registrarPagamento(Long pedidoId, RegistrarPagamentoRequest request) {
		log.info("Registrando pagamento do pedido {}", pedidoId);
		Pedido pedido = validarPedidoExistente(pedidoId);

		if (pedido.getStatusPagamento() == StatusPagamento.PAGO) {
			throw new NegocioException("Pedido já está pago");
		}

		if (pedido.getStatus() == StatusPedido.CANCELADO) {
			throw new NegocioException("Não é possível pagar um pedido cancelado");
		}

		pedido.setMetodoPagamento(request.getMetodoPagamento());
		pedido.setStatusPagamento(StatusPagamento.PAGO);
		pedido.setDataHoraPagamento(LocalDateTime.now());

		pedido = pedidoRepository.save(pedido);

		// 🔥 ATUALIZAR TOTAIS DO CAIXA (PAGAMENTO)
		caixaDiarioService.atualizarTotaisPagamento(pedido);

		log.info("Pagamento registrado com sucesso e totais do caixa atualizados");
		return pedidoMapper.toResponse(pedido);
	}

	public PedidoResponse cancelarPedido(Long id) {
		log.info("Cancelando pedido {}", id);
		Pedido pedido = validarPedidoExistente(id);

		if (pedido.getStatus() == StatusPedido.ENTREGUE) {
			throw new NegocioException("Não é possível cancelar um pedido já entregue");
		}

		if (pedido.getStatus() == StatusPedido.CANCELADO) {
			throw new NegocioException("Pedido já está cancelado");
		}

		pedido.setStatus(StatusPedido.CANCELADO);
		pedido = pedidoRepository.save(pedido);

		// 🔥 ATUALIZAR TOTAIS DE CANCELAMENTO
		caixaDiarioService.atualizarTotaisCancelamento(pedido);

		log.info("Pedido cancelado e totais de cancelamento atualizados");
		return pedidoMapper.toResponse(pedido);
	}

	public PedidoResponse buscarPedidoPorId(Long id) {
		log.info("Buscando pedido com ID: {}", id);
		Pedido pedido = validarPedidoExistente(id);
		return pedidoMapper.toResponse(pedido);
	}

	public List<PedidoResponse> listarPedidosPorStatus(StatusPedido status) {
		log.info("Listando pedidos com status: {}", status);
		List<Pedido> pedidos;
		if (status == null) {
			pedidos = pedidoRepository.findAll();
		} else {
			pedidos = pedidoRepository.findByStatus(status);
		}
		return pedidos.stream().map(pedidoMapper::toResponse).collect(Collectors.toList());
	}

	public PedidoResponse atualizarStatusPedido(Long id, StatusPedido novoStatus) {
		log.info("Atualizando status do pedido {} para: {}", id, novoStatus);
		Pedido pedido = validarPedidoExistente(id);

		// Validar transições de status
		validarTransicaoStatus(pedido.getStatus(), novoStatus);

		pedido.setStatus(novoStatus);

		// Atualizar timestamps específicos
		if (novoStatus == StatusPedido.PRONTO) {
			pedido.setDataHoraPronto(LocalDateTime.now());
		} else if (novoStatus == StatusPedido.ENTREGUE) {
			pedido.setDataHoraEntrega(LocalDateTime.now());
		}

		pedido = pedidoRepository.save(pedido);
		return pedidoMapper.toResponse(pedido);
	}

	public PedidoResponse atualizarItemPedido(Long pedidoId, Long itemId, AtualizarItemRequest request) {
		log.info("Atualizando item {} do pedido {}", itemId, pedidoId);
		Pedido pedido = validarPedidoExistente(pedidoId);

		ItemPedido item = itemPedidoRepository.findById(itemId)
				.orElseThrow(() -> new NegocioException("Item não encontrado"));

		if (!item.getPedido().getId().equals(pedidoId)) {
			throw new NegocioException("Item não pertence ao pedido informado");
		}

		if (pedido.getStatus() == StatusPedido.ENTREGUE || pedido.getStatus() == StatusPedido.CANCELADO) {
			throw new NegocioException("Não é possível alterar itens de um pedido " + pedido.getStatus());
		}

		item.setQuantidade(request.getQuantidade());
		item.setObservacaoItem(request.getObservacao());
		itemPedidoRepository.save(item);

		recalcularValorTotal(pedido);
		pedido = pedidoRepository.save(pedido);

		return pedidoMapper.toResponse(pedido);
	}

	public PedidoResponse removerItemPedido(Long pedidoId, Long itemId) {
		log.info("Removendo item {} do pedido {}", itemId, pedidoId);
		Pedido pedido = validarPedidoExistente(pedidoId);

		ItemPedido item = itemPedidoRepository.findById(itemId)
				.orElseThrow(() -> new NegocioException("Item não encontrado"));

		if (!item.getPedido().getId().equals(pedidoId)) {
			throw new NegocioException("Item não pertence ao pedido informado");
		}

		if (pedido.getStatus() == StatusPedido.ENTREGUE || pedido.getStatus() == StatusPedido.CANCELADO) {
			throw new NegocioException("Não é possível remover itens de um pedido " + pedido.getStatus());
		}

		pedido.getItens().remove(item);
		itemPedidoRepository.delete(item);

		recalcularValorTotal(pedido);
		pedido = pedidoRepository.save(pedido);

		return pedidoMapper.toResponse(pedido);
	}

	public FilaCozinhaResponse buscarFilaCozinha() {
		log.info("Buscando fila da cozinha");

		List<Pedido> pedidos = pedidoRepository.findByStatusIn(List.of(StatusPedido.RECEBIDO, StatusPedido.PREPARANDO));

		// Ordenar por data/hora (mais antigo primeiro)
		pedidos.sort((p1, p2) -> p1.getDataHoraPedido().compareTo(p2.getDataHoraPedido()));

		List<FilaCozinhaResponse.PedidoResumidoResponse> pedidosResumidos = pedidos.stream().map(this::toPedidoResumido)
				.collect(Collectors.toList());

		return FilaCozinhaResponse.builder().totalPedidos(pedidosResumidos.size()).pedidos(pedidosResumidos).build();
	}

	public List<PedidoResponse> listarPedidosPorStatus(List<StatusPedido> statuses) {
		log.info("Listando pedidos com status: {}", statuses);
		List<Pedido> pedidos = pedidoRepository.findByStatusIn(statuses);
		return pedidos.stream().map(pedidoMapper::toResponse).collect(Collectors.toList());
	}

	/**
	 * Atualiza o status de um item do pedido e verifica se o pedido deve mudar de
	 * status
	 */
	public void atualizarStatusItem(Long pedidoId, Long itemId, StatusItemPedido novoStatus) {
		log.info("Atualizando status do item {} do pedido {} para {}", itemId, pedidoId, novoStatus);

		// 1. Buscar o pedido
		Pedido pedido = validarPedidoExistente(pedidoId);

		// 2. Buscar o item dentro do pedido
		ItemPedido item = pedido.getItens().stream().filter(i -> i.getId().equals(itemId)).findFirst()
				.orElseThrow(() -> new ItemNaoEncontradoException(itemId));

		// 3. Validar se o pedido permite alteração
		if (pedido.getStatus() == StatusPedido.CANCELADO || pedido.getStatus() == StatusPedido.ENTREGUE) {
			throw new NegocioException("Não é possível alterar itens de um pedido " + pedido.getStatus());
		}

		// 4. Atualizar status do item
		item.setStatus(novoStatus);
		itemPedidoRepository.save(item);

		// 5. REGRA: Se pedido está RECEBIDO e item foi para PREPARANDO → Pedido vira
		// PREPARANDO
		if (pedido.getStatus() == StatusPedido.RECEBIDO && novoStatus == StatusItemPedido.PREPARANDO) {
			pedido.setStatus(StatusPedido.PREPARANDO);
			log.info("Pedido {} mudou para PREPARANDO", pedido.getId());
		}

		// 6. REGRA: Se todos os itens estão PRONTO → Pedido vira PRONTO
		if (pedido.todosItensProntos()) {
			pedido.setStatus(StatusPedido.PRONTO);
			pedido.setDataHoraPronto(LocalDateTime.now());
			log.info("Pedido {} mudou para PRONTO", pedido.getId());
		}

		pedidoRepository.save(pedido);
	}

	// ===== MÉTODOS PRIVADOS =====

	private Integer gerarNumeroPedido() {
		LocalDate hoje = LocalDate.now();
		LocalDateTime inicio = hoje.atStartOfDay();
		LocalDateTime fim = hoje.atTime(23, 59, 59);

		Integer maxNumero = pedidoRepository.findMaxNumeroByData(inicio, fim);
		return maxNumero != null ? maxNumero + 1 : 1;
	}

	private Pedido validarPedidoExistente(Long id) {
		return pedidoRepository.findById(id).orElseThrow(() -> new PedidoNaoEncontradoException(id));
	}

	private void validarTransicaoStatus(StatusPedido atual, StatusPedido novo) {
		if (atual == StatusPedido.CANCELADO) {
			throw new NegocioException("Não é possível alterar um pedido cancelado");
		}

		if (atual == StatusPedido.ENTREGUE && novo != StatusPedido.CANCELADO) {
			throw new NegocioException("Não é possível alterar um pedido entregue");
		}
	}

	private void recalcularValorTotal(Pedido pedido) {
		BigDecimal total = pedido.getItens().stream()
				.map(item -> item.getPrecoUnitario().multiply(BigDecimal.valueOf(item.getQuantidade())))
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		pedido.setValorTotal(total);
	}

	private FilaCozinhaResponse.PedidoResumidoResponse toPedidoResumido(Pedido pedido) {
		List<FilaCozinhaResponse.ItemResumidoResponse> itens = pedido.getItens().stream()
				.map(item -> FilaCozinhaResponse.ItemResumidoResponse.builder().id(item.getId())
						.nomeProduto(item.getProduto().getNome()).quantidade(item.getQuantidade())
						.status(item.getStatus().name()).build())
				.collect(Collectors.toList());

		int tempoEspera = calcularTempoEstimado(pedido);

		return FilaCozinhaResponse.PedidoResumidoResponse.builder().id(pedido.getId()).numero(pedido.getNumero())
				.nomeCliente(pedido.getNomeCliente()).dataHoraPedido(pedido.getDataHoraPedido())
				.tempoEsperaMinutos(tempoEspera).itens(itens).build();
	}

	private int calcularTempoEstimado(Pedido pedido) {
		return pedido.getItens().stream()
				.mapToInt(item -> item.getProduto().getTempoPreparoMinutos() * item.getQuantidade()).sum();
	}

	private void vincularComandaAutomaticamente(Pedido pedido) {
		if (pedido.getTipo().name().equals("COMER_AQUI")) {
			List<Comanda> comandasAbertas = comandaRepository.findByStatusOrderByAberturaAsc(StatusComanda.ABERTA);

			Comanda comanda = comandasAbertas.stream()
					.filter(c -> c.getNomeCliente().equalsIgnoreCase(pedido.getNomeCliente())).findFirst().orElse(null);

			if (comanda != null) {
				ComandaPedido comandaPedido = new ComandaPedido();
				comandaPedido.setComanda(comanda);
				comandaPedido.setPedido(pedido);
				comandaPedido.setCreatedAt(LocalDateTime.now());
				comandaPedidoRepository.save(comandaPedido);

				comanda.getComandaPedidos().add(comandaPedido);
				comanda.setValorTotal(comanda.getValorTotal().add(pedido.getValorTotal()));
				comandaRepository.save(comanda);

				log.info("Pedido #{} vinculado automaticamente à comanda {} do cliente {}", pedido.getNumero(),
						comanda.getCodigo(), pedido.getNomeCliente());
			} else {
				log.info("Nenhuma comanda aberta encontrada para o cliente {}. Pedido #{} criado sem comanda.",
						pedido.getNomeCliente(), pedido.getNumero());
			}
		}
	}

	private void vincularComandaCliente(Pedido pedido, Cliente cliente) {
		List<Comanda> comandasAbertas = comandaRepository.findByStatusOrderByAberturaAsc(StatusComanda.ABERTA);
		Comanda comanda = comandasAbertas.stream()
				.filter(c -> c.getNomeCliente().equalsIgnoreCase(cliente.getNomeCompleto())).findFirst().orElse(null);

		if (comanda != null) {
			ComandaPedido comandaPedido = new ComandaPedido();
			comandaPedido.setComanda(comanda);
			comandaPedido.setPedido(pedido);
			comandaPedido.setCreatedAt(LocalDateTime.now());
			comandaPedidoRepository.save(comandaPedido);
			comanda.getComandaPedidos().add(comandaPedido);
			comanda.setValorTotal(comanda.getValorTotal().add(pedido.getValorTotal()));
			comandaRepository.save(comanda);
		}
	}

	/**
	 * Atualiza um pedido existente Permite alterar: nomeCliente, tipo, observação,
	 * itens
	 */
	public PedidoResponse atualizarPedido(Long pedidoId, AtualizarPedidoRequest request) {
		log.info("Atualizando pedido {} para cliente: {}", pedidoId, request.getNomeCliente());

		// 1. Buscar pedido existente
		Pedido pedido = validarPedidoExistente(pedidoId);

		// 2. Validar se pedido pode ser alterado
		if (pedido.getStatus() == StatusPedido.ENTREGUE || pedido.getStatus() == StatusPedido.CANCELADO) {
			throw new NegocioException("Não é possível alterar um pedido " + pedido.getStatus());
		}

		// 3. Atualizar dados básicos
		pedido.setNomeCliente(request.getNomeCliente());
		pedido.setTipo(request.getTipo());
		pedido.setObservacao(request.getObservacao());

		// 4. Atualizar itens
		if (request.getItens() != null && !request.getItens().isEmpty()) {
			// Limpar itens existentes
			itemPedidoRepository.deleteAll(pedido.getItens());
			pedido.getItens().clear();

			// Adicionar novos itens
			for (AtualizarPedidoRequest.ItemPedidoRequest itemRequest : request.getItens()) {
				Produto produto = produtoRepository.findById(itemRequest.getProdutoId())
						.orElseThrow(() -> new ProdutoNaoEncontradoException(itemRequest.getProdutoId()));

				ItemPedido item = new ItemPedido();
				item.setPedido(pedido);
				item.setProduto(produto);
				item.setQuantidade(itemRequest.getQuantidade());
				item.setPrecoUnitario(produto.getPreco());
				item.setStatus(StatusItemPedido.PENDENTE);
				item.setObservacaoItem(itemRequest.getObservacao());

				pedido.getItens().add(item);
			}
		}

		// 5. Recalcular valor total
		recalcularValorTotal(pedido);

		// 6. Salvar
		pedido = pedidoRepository.save(pedido);

		// 7. Atualizar comanda se houver
		atualizarComanda(pedido);

		log.info("Pedido {} atualizado com sucesso", pedido.getNumero());
		return pedidoMapper.toResponse(pedido);
	}

	/**
	 * Atualiza o valor total da comanda se o pedido estiver vinculado a uma
	 */
	private void atualizarComanda(Pedido pedido) {
		if (pedido.getComandaPedido() != null) {
			Comanda comanda = pedido.getComandaPedido().getComanda();
			if (comanda != null) {
				BigDecimal total = comanda.getComandaPedidos().stream().map(cp -> cp.getPedido().getValorTotal())
						.reduce(BigDecimal.ZERO, BigDecimal::add);
				comanda.setValorTotal(total);
				comandaRepository.save(comanda);
			}
		}
	}

	/**
	 * Visualizar o pagamento sem confirmar (dono pode ver e alterar)
	 */
	public PedidoResponse visualizarPagamento(Long pedidoId, RegistrarPagamentoRequest request) {
		log.info("Visualizando pagamento do pedido {}", pedidoId);
		Pedido pedido = validarPedidoExistente(pedidoId);

		// Só atualiza a forma de pagamento, não confirma
		pedido.setMetodoPagamento(request.getMetodoPagamento());
		pedido = pedidoRepository.save(pedido);

		return pedidoMapper.toResponse(pedido);
	}
}