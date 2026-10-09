package com.filacerta.application.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.request.AtualizarPedidoRequest;
import com.filacerta.application.dto.request.CriarPedidoRequest;
import com.filacerta.application.dto.request.ItemPedidoRequest;
import com.filacerta.application.dto.response.FilaCozinhaResponse;
import com.filacerta.application.dto.response.PedidoResponse;
import com.filacerta.application.mapper.PedidoMapper;
import com.filacerta.domain.entity.CaixaDiario;
import com.filacerta.domain.entity.ItemPedido;
import com.filacerta.domain.entity.Pedido;
import com.filacerta.domain.entity.Produto;
import com.filacerta.domain.enums.FormaPagamento;
import com.filacerta.domain.enums.StatusItemPedido;
import com.filacerta.domain.enums.StatusPagamento;
import com.filacerta.domain.enums.StatusPedido;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.infrastructure.repository.ItemPedidoRepository;
import com.filacerta.infrastructure.repository.PedidoRepository;
import com.filacerta.infrastructure.repository.ProdutoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PedidoService {

	private final PedidoRepository pedidoRepository;
	private final ProdutoService produtoService;
	private final CaixaDiarioService caixaDiarioService;
	private final ProdutoRepository produtoRepository;
	private final ItemPedidoRepository itemPedidoRepository;
	private final SimpMessagingTemplate messagingTemplate;
	

	@Transactional
	public PedidoResponse criarPedido(CriarPedidoRequest request) {

		// 1. Validar caixa aberto
		CaixaDiario caixa = caixaDiarioService.buscarCaixaAberto();

		if (Boolean.TRUE.equals(caixa.getCozinhaPausada())) {
			if (request.getOrigem() == null || !request.getOrigem().name().equals("MANUAL")) {
				throw new NegocioException("A cozinha está Pausada no momento. Não é possĩvel aceitar novos pedidos.");
			}
		}

		// 2. Instanciar pedido com dados básicos
		Pedido pedido = new Pedido();
		pedido.setNomeCliente(request.getNomeCliente());
		pedido.setTipo(request.getTipo());
		pedido.setOrigem(request.getOrigem());

		// Garante que o pedido caia direto no radar da cozinha
		pedido.setStatus(StatusPedido.RECEBIDO);

		// ---> A LINHA QUE HAVIA SUMIDO VOLTOU AQUI <---
		pedido.setDataHoraPedido(LocalDateTime.now());

		// Salvando a forma de pagamento e status
		pedido.setFormaPagamento(
				request.getFormaPagamento() != null ? request.getFormaPagamento() : FormaPagamento.NAO_INFORMADO);

		if (request.getFormaPagamento() != null) {
			pedido.setStatusPagamento(request.getStatusPagamento());
		} else {
			pedido.setStatusPagamento(StatusPagamento.AGUARDANDO);
		}

		// 3. Gerar número sequencial do dia
		LocalDateTime inicioDoDia = LocalDate.now().atStartOfDay();
		LocalDateTime fimDoDia = LocalDate.now().plusDays(1).atStartOfDay();
		Integer maxNumero = pedidoRepository.findMaxNumeroByData(inicioDoDia, fimDoDia).orElse(0);
		pedido.setNumero(maxNumero + 1);

		// GERA UM CÓDIGO ÚNICO DE 8 LETRAS/NÚMEROS (Ex: 8F3A2B19)
		String codigo = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
		pedido.setCodigoAcompanhamento(codigo);

		// 4. Processar Itens e Baixar Estoque
		for (ItemPedidoRequest itemReq : request.getItens()) {
			Produto produto = produtoService.buscarPorId(itemReq.getProdutoId());

			// Trava de Estoque
			if (produto.getQuantidadeDisponivel() != null) {
				if (produto.getQuantidadeDisponivel() < itemReq.getQuantidade()) {
					throw new NegocioException("Estoque insuficiente para o produto: " + produto.getNome());
				}
				produto.setQuantidadeDisponivel(produto.getQuantidadeDisponivel() - itemReq.getQuantidade());
			}

			ItemPedido item = ItemPedido.builder().pedido(pedido).produto(produto).quantidade(itemReq.getQuantidade())
					.precoUnitario(produto.getPreco()).observacaoItem(itemReq.getObservacaoItem())
					.status(StatusItemPedido.PENDENTE) // Garante a tela da cozinha
					.build();

			pedido.getItens().add(item);
		}

		pedido.setCaixaDiario(caixa);

		// 5. Calcular valor total e salvar
		pedido.calcularValorTotal();
		Pedido pedidoSalvo = pedidoRepository.save(pedido);

		// AVISA A COZINHA E O CAIXA: "Chegou um pedido novo!"
		messagingTemplate.convertAndSend("/topic/pedidos", "ATUALIZOU");

		// 6. Retornar DTO de resposta
		return PedidoMapper.toResponse(pedidoSalvo);
	}

	// NOVO MÉTODO PARA BUSCAR PELO CÓDIGO (Em vez do ID sequencial)
	@Transactional(readOnly = true)
	public PedidoResponse buscarPorCodigo(String codigo) {
		Pedido pedido = pedidoRepository.findByCodigoAcompanhamento(codigo)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado."));
		return PedidoMapper.toResponse(pedido);
	}

	@Transactional(readOnly = true)
	public List<FilaCozinhaResponse> buscarFilaCozinha() {
		// Busca pedidos que estão RECEBIDO, PREPARANDO ou PRONTO
		List<Pedido> pedidosAtivos = pedidoRepository.findAll().stream()
				.filter(p -> p.getStatus() == StatusPedido.RECEBIDO || p.getStatus() == StatusPedido.PREPARANDO
						|| p.getStatus() == StatusPedido.PRONTO) 
				.collect(java.util.stream.Collectors.toList());

		// Ordenação e Mapeamento DENTRO da transação
		return pedidosAtivos.stream()
				.sorted(java.util.Comparator.comparing(this::temHamburguer, java.util.Comparator.reverseOrder())
						.thenComparing(Pedido::getDataHoraPedido))
				.map(com.filacerta.application.mapper.PedidoMapper::toFilaCozinhaResponse)
				.collect(java.util.stream.Collectors.toList());
	}

	private boolean temHamburguer(Pedido pedido) {
		return pedido.getItens().stream()
				.anyMatch(item -> item.getProduto() != null && item.getProduto().getCategoria() != null
						&& "Hamburguer".equalsIgnoreCase(item.getProduto().getCategoria().getNome()));
	}

	@Transactional
	public void atualizarStatusItem(Long pedidoId, Long itemId, StatusItemPedido novoStatus) {
		Pedido pedido = pedidoRepository.findById(pedidoId)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado: " + pedidoId));

		ItemPedido item = pedido.getItens().stream().filter(i -> i.getId().equals(itemId)).findFirst()
				.orElseThrow(() -> new NegocioException("Item não encontrado: " + itemId));

		// --- NOVA REGRA: DEVOLUÇÃO DE ESTOQUE (Item Individual) ---
		// Se o status novo for CANCELADO e o item já não estiver cancelado
		if (novoStatus == StatusItemPedido.CANCELADO && item.getStatus() != StatusItemPedido.CANCELADO) {
			Produto produto = item.getProduto();
			if (produto.getQuantidadeDisponivel() != null) {
				produto.setQuantidadeDisponivel(produto.getQuantidadeDisponivel() + item.getQuantidade());
			}
		}
		// ----------------------------------------------------------

		item.setStatus(novoStatus);

		// Se o pedido estava como RECEBIDO e alguém começou a preparar um item,
		// atualiza o pedido para PREPARANDO
		if (pedido.getStatus() == StatusPedido.RECEBIDO && novoStatus == StatusItemPedido.PREPARANDO) {
			pedido.setStatus(StatusPedido.PREPARANDO);
		}

		// Verifica se TODOS os itens do pedido estão PRONTOS
		if (pedido.todosItensProntos()) {
			pedido.setStatus(StatusPedido.PRONTO);
			pedido.setDataHoraPronto(LocalDateTime.now());
		}

		messagingTemplate.convertAndSend("/topic/pedidos", "ATUALIZOU");

		pedidoRepository.save(pedido);
	}

	@Transactional(readOnly = true)
	public PedidoResponse buscarPorId(Long id) {
		Pedido pedido = pedidoRepository.findById(id)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado: " + id));

		return PedidoMapper.toResponse(pedido);
	}

	@Transactional(readOnly = true)
	public List<PedidoResponse> listarPedidoPagamentoPendente() {
		return pedidoRepository.findAll().stream()
				// ---> A MÁGICA AQUI: Filtra e expulsa os cancelados da lista! <---
				.filter(p -> p.getStatus() != StatusPedido.CANCELADO)

				.filter(p -> p.getStatusPagamento() == StatusPagamento.AGUARDANDO
						|| p.getStatus() == StatusPedido.PRONTO || p.getStatus() == StatusPedido.SERVIDO)
				.sorted(Comparator.comparing(Pedido::getDataHoraPedido).reversed()).map(PedidoMapper::toResponse)
				.collect(Collectors.toList());
	}

	@Transactional
	public void atualizarStatusPagamento(Long pedidoId, StatusPagamento novoStatus) {
		Pedido pedido = pedidoRepository.findById(pedidoId)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado" + pedidoId));

		pedido.setStatusPagamento(novoStatus);
		pedidoRepository.save(pedido);

		messagingTemplate.convertAndSend("/topic/pedidos", "ATUALIZOU");
	}

	@Transactional
	public void avancarStatusPedido(Long pedidoId) {
		Pedido pedido = pedidoRepository.findById(pedidoId)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado: " + pedidoId));

		if (pedido.getStatus() == StatusPedido.PRONTO) {

			// 1. Bifurcação: Comer Aqui vs Levar
			if (String.valueOf(pedido.getTipo()).equals("COMER_AQUI")) {
				// Fica na mesa comendo, pagamento ainda pendente
				pedido.setStatus(StatusPedido.SERVIDO);
			} else {
				// Pega o lanche e vai embora, já liquida o pagamento
				pedido.setStatus(StatusPedido.ENTREGUE);
				if (pedido.getStatusPagamento() != StatusPagamento.PAGO) {
					pedido.setStatusPagamento(StatusPagamento.PAGO);
				}
			}

		} else if (pedido.getStatus() == StatusPedido.SERVIDO) {

			// 2. Cliente terminou de comer e foi ao caixa pagar
			pedido.setStatus(StatusPedido.ENTREGUE);
			if (pedido.getStatusPagamento() != StatusPagamento.PAGO) {
				pedido.setStatusPagamento(StatusPagamento.PAGO);
			}

		}

		pedidoRepository.save(pedido);

		messagingTemplate.convertAndSend("/topic/pedidos", "ATUALIZOU");
	}

	@Transactional
    public void cancelarPedido(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NegocioException("Pedido não encontrado: " + pedidoId));
        
        System.out.println(">>> CANCELAR - Status atual: " + pedido.getStatus()); 

        // ---> CORREÇÃO AQUI: Adicionado o ENTREGUE na lista de bloqueio <---
        if (pedido.getStatus() == StatusPedido.PREPARANDO || 
            pedido.getStatus() == StatusPedido.PRONTO || 
            pedido.getStatus() == StatusPedido.SERVIDO || 
            pedido.getStatus() == StatusPedido.ENTREGUE) {
            throw new NegocioException("Este pedido já está em preparo ou foi concluído e não pode ser cancelado.");
        }

		// Trava de segurança original: só devolve se o pedido ainda não estiver
		// cancelado
		if (pedido.getStatus() != StatusPedido.CANCELADO) {

			// Varre todos os itens do pedido para devolver ao estoque
			for (ItemPedido item : pedido.getItens()) {
				Produto produto = item.getProduto();

				if (produto.getQuantidadeDisponivel() != null) {
					produto.setQuantidadeDisponivel(produto.getQuantidadeDisponivel() + item.getQuantidade());
				}

				// Atualiza o status do item individual para manter a tela da cozinha
				// consistente
				item.setStatus(StatusItemPedido.CANCELADO);
			}
		}

		pedido.setStatus(StatusPedido.CANCELADO);
		pedidoRepository.save(pedido);

		messagingTemplate.convertAndSend("/topic/pedidos", "ATUALIZOU");
	}
	
	@Transactional
	public PedidoResponse atualizarPedido(String codigo, AtualizarPedidoRequest request) {
		Pedido pedido = pedidoRepository.findByCodigoAcompanhamento(codigo)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado."));

		// ---> TRAVA DE STATUS (Verifique se o seu Enum usa "AGUARDANDO" ou "PENDENTE")
		// Se o seu enum de status do pedido usa outro valor, ajuste aqui (ex: StatusPedido.AGUARDANDO_PAGAMENTO)
		if (pedido.getStatus() != StatusPedido.RECEBIDO) {
			throw new NegocioException("O pedido já está em preparo e não pode ser alterado.");
		}

		// 1. Devolve o estoque dos itens antigos
		for (ItemPedido item : pedido.getItens()) {
			Produto produto = item.getProduto();
			if (produto.getQuantidadeDisponivel() != null) {
				produto.setQuantidadeDisponivel(produto.getQuantidadeDisponivel() + item.getQuantidade());
			}
		}

		// 2. Limpa a lista antiga (o orphanRemoval remove do banco)
		pedido.getItens().clear();

		// 3. Processa os novos itens (usando getProdutoId(), getQuantidade() e getObservacaoItem())
		BigDecimal valorTotal = BigDecimal.ZERO;
		for (var itemReq : request.itens()) {
			// Usando o seu repositório padrão de produtos (produtoRepository ou o que já injetou na classe)
			Produto produto = produtoRepository.findById(itemReq.getProdutoId())
					.orElseThrow(() -> new NegocioException("Produto não encontrado."));

			// Baixa no estoque dos novos
			if (produto.getQuantidadeDisponivel() != null) {
				if (produto.getQuantidadeDisponivel() < itemReq.getQuantidade()) {
					throw new NegocioException("Estoque insuficiente para o produto: " + produto.getNome());
				}
				produto.setQuantidadeDisponivel(produto.getQuantidadeDisponivel() - itemReq.getQuantidade());
			}

			ItemPedido novoItem = new ItemPedido();
			novoItem.setPedido(pedido);
			novoItem.setProduto(produto);
			novoItem.setQuantidade(itemReq.getQuantidade());
			novoItem.setPrecoUnitario(produto.getPreco());
			novoItem.setObservacaoItem(itemReq.getObservacaoItem());
			novoItem.setStatus(StatusItemPedido.PENDENTE);

			pedido.getItens().add(novoItem);
			valorTotal = valorTotal.add(produto.getPreco().multiply(new BigDecimal(itemReq.getQuantidade())));
		}

		// Atualiza o valor final da conta
		pedido.setValorTotal(valorTotal);
		pedidoRepository.save(pedido);

		// Avisa a cozinha e o caixa via WebSocket
		messagingTemplate.convertAndSend("/topic/pedidos", "ATUALIZOU");
		messagingTemplate.convertAndSend("/topic/caixa", "ATUALIZOU");

		return PedidoMapper.toResponse(pedido);
	}
	
	@Transactional
	public PedidoResponse adicionarItensAoPedido(String codigo, AtualizarPedidoRequest request) {
		Pedido pedido = pedidoRepository.findByCodigoAcompanhamento(codigo)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado."));

		// Trava: Não pode adicionar se o cliente já pegou o pacote e foi embora (ENTREGUE) ou foi CANCELADO
		if (pedido.getStatus() == StatusPedido.ENTREGUE || pedido.getStatus() == StatusPedido.CANCELADO) {
			throw new NegocioException("Este pedido já foi finalizado. Por favor, inicie um novo pedido.");
		}

		// Processa APENAS os novos itens
		for (var itemReq : request.itens()) {
			Produto produto = produtoRepository.findById(itemReq.getProdutoId())
					.orElseThrow(() -> new NegocioException("Produto não encontrado."));

			// Baixa no estoque
			if (produto.getQuantidadeDisponivel() != null) {
				if (produto.getQuantidadeDisponivel() < itemReq.getQuantidade()) {
					throw new NegocioException("Estoque insuficiente para o produto: " + produto.getNome());
				}
				produto.setQuantidadeDisponivel(produto.getQuantidadeDisponivel() - itemReq.getQuantidade());
			}

			ItemPedido novoItem = new ItemPedido();
			novoItem.setPedido(pedido);
			novoItem.setProduto(produto);
			novoItem.setQuantidade(itemReq.getQuantidade());
			novoItem.setPrecoUnitario(produto.getPreco());
			novoItem.setObservacaoItem(itemReq.getObservacaoItem());
			novoItem.setStatus(StatusItemPedido.PENDENTE);

			// ---> SALVA O ITEM EXPLICITAMENTE ANTES DE ADICIONAR <---
			itemPedidoRepository.save(novoItem);

			pedido.getItens().add(novoItem);
		}

		// Recalcula o valor total da comanda
		pedido.calcularValorTotal();

		// Se a conta já estava paga, agora ficou pendente de novo (porque pediu mais)
		if (pedido.getStatusPagamento() == StatusPagamento.PAGO) {
			pedido.setStatusPagamento(StatusPagamento.AGUARDANDO);
		}

		// Se o pedido estava pronto ou na mesa, volta para a aba "Em Preparo" da Cozinha
		if (pedido.getStatus() == StatusPedido.PRONTO || pedido.getStatus() == StatusPedido.SERVIDO) {
			pedido.setStatus(StatusPedido.PREPARANDO);
		}

		Pedido pedidoSalvo = pedidoRepository.save(pedido);

		// Avisa a TV, a Cozinha e o Caixa
		messagingTemplate.convertAndSend("/topic/pedidos", "ATUALIZOU");
		messagingTemplate.convertAndSend("/topic/caixa", "ATUALIZOU");

		return PedidoMapper.toResponse(pedidoSalvo);
	}
}