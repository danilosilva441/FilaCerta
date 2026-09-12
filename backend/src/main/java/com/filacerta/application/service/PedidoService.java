package com.filacerta.application.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.request.CriarPedidoRequest;
import com.filacerta.application.dto.request.ItemPedidoRequest;
import com.filacerta.application.dto.response.FilaCozinhaResponse;
import com.filacerta.application.dto.response.PedidoResponse;
import com.filacerta.application.mapper.PedidoMapper;
import com.filacerta.domain.entity.CaixaDiario;
import com.filacerta.domain.entity.Categoria;
import com.filacerta.domain.entity.ItemPedido;
import com.filacerta.domain.entity.Pedido;
import com.filacerta.domain.entity.Produto;
import com.filacerta.domain.enums.FormaPagamento;
import com.filacerta.domain.enums.StatusCaixa;
import com.filacerta.domain.enums.StatusItemPedido;
import com.filacerta.domain.enums.StatusPagamento;
import com.filacerta.domain.enums.StatusPedido;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.infrastructure.repository.CaixaDiarioRepository;
import com.filacerta.infrastructure.repository.PedidoRepository;
import com.filacerta.infrastructure.repository.ProdutoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PedidoService {

	private final PedidoRepository pedidoRepository;
	private final ProdutoRepository produtoRepository;
	private final CaixaDiarioRepository caixaDiarioRepository;
	private final ProdutoService produtoService;
	private final CaixaDiarioService caixaDiarioService;

	@Transactional
	public PedidoResponse criarPedido(CriarPedidoRequest request) {
		
		
		// 1. Validar caixa aberto
		CaixaDiario caixa = caixaDiarioService.buscarCaixaAberto();
		
		// 2. Instanciar pedido com dados básicos
		Pedido pedido = new Pedido();
	    pedido.setNomeCliente(request.getNomeCliente());
	    pedido.setTipo(request.getTipo());
	    pedido.setOrigem(request.getOrigem());
	    
	    // Salvando a forma de pagamento
	    pedido.setFormaPagamento(request.getFormaPagamento() != null ? request.getFormaPagamento() : FormaPagamento.NAO_INFORMADO);
	    
	    pedido.setDataHoraPedido(LocalDateTime.now());
	    
	    //Se a requisição mandar um status, usa ele. Se não, o padrão é AGUARDANDO.
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

		// 4. Processar Itens
		for (ItemPedidoRequest itemReq : request.getItens()) {
			Produto produto = produtoService.buscarPorId(itemReq.getProdutoId());

			ItemPedido item = ItemPedido.builder()
					.pedido(pedido)
					.produto(produto)
					.quantidade(itemReq.getQuantidade())
					.precoUnitario(produto.getPreco()) // Trava o preço no momento da compra
					.observacaoItem(itemReq.getObservacaoItem())
					.build();

			pedido.getItens().add(item);
		}

		CaixaDiario caixaAberto = caixaDiarioRepository.findByStatus(StatusCaixa.ABERTO)
				.orElseThrow(() -> new NegocioException("Não é possível fazer pedidos com caixa fechado!"));
		
		// 5. Calcular valor total e salvar
		pedido.calcularValorTotal();
		Pedido pedidoSalvo = pedidoRepository.save(pedido);

		
		pedido.setCaixaDiario(caixaAberto);
		// 6. Retornar DTO de resposta
		return PedidoMapper.toResponse(pedidoSalvo);
		
		
	}

	@Transactional(readOnly = true)
	public List<FilaCozinhaResponse> buscarFilaCozinha() {
		// Busca pedidos que estão RECEBIDO, PREPARANDO ou PRONTO
		List<Pedido> pedidosAtivos = pedidoRepository.findAll().stream()
				.filter(p -> p.getStatus() == StatusPedido.RECEBIDO
						|| p.getStatus() == StatusPedido.PREPARANDO
						|| p.getStatus() == StatusPedido.PRONTO) // <--- ADICIONAMOS AQUI
				.collect(java.util.stream.Collectors.toList());

		// Ordenação e Mapeamento DENTRO da transação
		return pedidosAtivos.stream()
				.sorted(java.util.Comparator.comparing(this::temHamburguer, java.util.Comparator.reverseOrder())
						.thenComparing(Pedido::getDataHoraPedido))
				.map(com.filacerta.application.mapper.PedidoMapper::toFilaCozinhaResponse) 
				.collect(java.util.stream.Collectors.toList());
	}

	private boolean temHamburguer(Pedido pedido) {
		return pedido.getItens().stream().anyMatch(item -> 
				item.getProduto() != null && 
				item.getProduto().getCategoria() != null && 
				"Hamburguer".equalsIgnoreCase(item.getProduto().getCategoria().getNome())
		);
	}

	@Transactional
	public void atualizarStatusItem(Long pedidoId, Long itemId,
			StatusItemPedido novoStatus) {
		Pedido pedido = pedidoRepository.findById(pedidoId).orElseThrow(
				() -> new NegocioException("Pedido não encontrado: " + pedidoId));

		ItemPedido item = pedido.getItens().stream().filter(i -> i.getId().equals(itemId)).findFirst().orElseThrow(
				() -> new NegocioException("Item não encontrado: " + itemId));

		item.setStatus(novoStatus);

		// Se o pedido estava como RECEBIDO e alguém começou a preparar um item,
		// atualiza o pedido para PREPARANDO
		if (pedido.getStatus() == StatusPedido.RECEBIDO
				&& novoStatus == StatusItemPedido.PREPARANDO) {
			pedido.setStatus(StatusPedido.PREPARANDO);
		}

		// Verifica se TODOS os itens do pedido estão PRONTOS
		if (pedido.todosItensProntos()) {
			pedido.setStatus(StatusPedido.PRONTO);
			pedido.setDataHoraPronto(LocalDateTime.now());
		}

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
		return pedidoRepository.findAll().stream().filter(p -> p.getStatusPagamento() == StatusPagamento.AGUARDANDO)
				.sorted(Comparator.comparing(Pedido::getDataHoraPedido).reversed())
				.map(PedidoMapper::toResponse)
				.collect(Collectors.toList());
	}
	
	@Transactional
	public void atualizarStatusPagamento(Long pedidoId, StatusPagamento novoStatus) {
		Pedido pedido = pedidoRepository.findById(pedidoId)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado" + pedidoId));
		
		pedido.setStatusPagamento(novoStatus);
		pedidoRepository.save(pedido);
	}
	
	@Transactional
    public void finalizarEntrega(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NegocioException("Pedido não encontrado: " + pedidoId));

        // 1. Muda o status do lanche para ENTREGUE
        pedido.setStatus(StatusPedido.ENTREGUE);
        
        // 2. Garante que o pagamento consta como PAGO
        if (pedido.getStatusPagamento() != StatusPagamento.PAGO) {
            pedido.setStatusPagamento(StatusPagamento.PAGO);
        }

        pedidoRepository.save(pedido);
    }
	
	@Transactional
    public void cancelarPedido(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NegocioException("Pedido não encontrado: " + pedidoId));

        pedido.setStatus(StatusPedido.CANCELADO);
        pedidoRepository.save(pedido);
    }
}