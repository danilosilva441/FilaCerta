import { Routes } from '@angular/router';
import { CaixaAbertoGuard } from './core/guards/caixa-aberto.guard';

export const routes: Routes = [
  // Redirecionamento inicial
  { path: '', redirectTo: 'cliente/cardapio', pathMatch: 'full' },

  // Cliente (🔒 precisa caixa aberto)
  {
    path: 'cliente/cardapio',
    loadComponent: () => import('./pages/cliente/cardapio/cardapio.component')
      .then(m => m.CardapioComponent),
    canActivate: [CaixaAbertoGuard]
  },
  {
    path: 'cliente/pedido/:id',
    loadComponent: () => import('./pages/cliente/pedido/pedido.component')
      .then(m => m.PedidoComponent),
    canActivate: [CaixaAbertoGuard]
  },
  {
    path: 'cliente/acompanhamento/:id',
    loadComponent: () => import('./pages/cliente/acompanhamento/acompanhamento.component')
      .then(m => m.AcompanhamentoComponent),
    canActivate: [CaixaAbertoGuard]
  },

  // Cozinha (🔒 precisa caixa aberto)
  {
    path: 'cozinha/painel',
    loadComponent: () => import('./pages/cozinha/painel/painel-cozinha.component')
      .then(m => m.PainelCozinhaComponent),
    canActivate: [CaixaAbertoGuard]
  },

  // Caixa (🔓 aberto para todos)
  {
    path: 'caixa/abertura',
    loadComponent: () => import('./pages/caixa/abertura/abertura-caixa.component')
      .then(m => m.AberturaCaixaComponent)
    // SEM guard — qualquer um pode abrir o caixa
  },
  {
    path: 'caixa/fechamento',
    loadComponent: () => import('./pages/caixa/fechamento/fechamento-caixa.component')
      .then(m => m.FechamentoCaixaComponent),
    canActivate: [CaixaAbertoGuard]
  },
  {
    path: 'caixa/pagamento/:id',
    loadComponent: () => import('./pages/caixa/pagamento/pagamento.component')
      .then(m => m.PagamentoComponent),
    canActivate: [CaixaAbertoGuard]
  },

  // Comanda (🔒 precisa caixa aberto)
  {
    path: 'comanda/:id',
    loadComponent: () => import('./pages/comanda/comanda-detalhe.component')
      .then(m => m.ComandaDetalheComponent),
    canActivate: [CaixaAbertoGuard]
  },

  // Fallback
  { path: '**', redirectTo: 'cliente/cardapio' }
];
