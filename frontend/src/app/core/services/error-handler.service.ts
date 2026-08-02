import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  private readonly errorMap: Record<string, string> = {
    'Estabelecimento Fechado': '🔒 Desculpe, estamos fechados no momento!',
    'Pedido não encontrado': '🔍 Pedido não encontrado. Verifique o número.',
    'Produto não encontrado': '🔍 Produto não disponível no momento.',
    'Comanda não encontrada': '🔍 Comanda não encontrada.',
    'Pedido já está pago': '✅ Este pedido já foi pago.',
    'Pedido já está cancelado': 'ℹ️ Este pedido já foi cancelado.',
    'Caixa já está aberto': 'ℹ️ Caixa já está aberto para hoje.',
    'Sessão inválida ou expirada': '🔒 Sua sessão expirou. Faça login novamente.',
    'Já existe um caixa aberto para hoje': 'ℹ️ O caixa já foi aberto hoje.',
    'O caixa de hoje já foi fechado': '🔒 O caixa de hoje já foi encerrado.',
    'Não há caixa aberto para hoje': '⚠️ Abra o caixa antes de continuar.',
    'Existem comandas abertas': '⚠️ Feche todas as comandas antes de fechar o caixa.',
    'Pedido já entregue': '📦 Este pedido já foi entregue.',
    'Não é possível cancelar': '❌ Não é possível cancelar este pedido.',
    'Não é possível pagar um pedido cancelado': '❌ Pedido cancelado não pode ser pago.',
    'Não é possível adicionar pedidos a uma comanda fechada': '🔒 Comanda já está fechada.',
    'Pedido não é COMER_AQUI': '⚠️ Apenas pedidos para comer no local podem ir para comanda.',
      'Caixa não encontrado para a data': '📅 Nenhum caixa encontrado para esta data.',
  };

  getMensagemAmigavel(error: HttpErrorResponse): string {
    const errorMessage = error.error?.message || '';

    for (const [key, value] of Object.entries(this.errorMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    if (error.status === 400) {
      return '⚠️ ' + (error.error?.message || 'Dados inválidos. Verifique e tente novamente.');
    }
    if (error.status === 401) {
      return '🔒 Faça login para continuar.';
    }
    if (error.status === 404) {
      return '🔍 O recurso solicitado não foi encontrado.';
    }
    if (error.status === 500) {
      return '❌ Ocorreu um erro interno. Tente novamente mais tarde.';
    }
    if (error.status === 0) {
      return '📡 Sem conexão com o servidor. Verifique sua internet.';
    }

    return error.error?.message || '❌ Ocorreu um erro inesperado. Tente novamente.';
  }

  getTitulo(error: HttpErrorResponse): string {
    if (error.status === 400) return 'Atenção';
    if (error.status === 401) return 'Não Autorizado';
    if (error.status === 404) return 'Não Encontrado';
    if (error.status === 500) return 'Erro no Servidor';
    return 'Erro';
  }

  isCaixaFechado(error: HttpErrorResponse): boolean {
    return error.status === 400 && error.error?.error === 'Estabelecimento Fechado';
  }

  isValidationError(error: HttpErrorResponse): boolean {
    return error.status === 400 && error.error?.error === 'Erro de Validação';
  }

  isUnauthorized(error: HttpErrorResponse): boolean {
    return error.status === 401;
  }

  isNotFound(error: HttpErrorResponse): boolean {
    return error.status === 404;
  }


}
