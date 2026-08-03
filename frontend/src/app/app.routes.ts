import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { DonoGuard } from './core/guards/dono.guard';
import { ClienteGuard } from './core/guards/cliente.guard';
import { CaixaAbertoGuard } from './core/guards/caixa-aberto.guard';

export const routes: Routes = [
  // ──── REDIRECIONAMENTO INICIAL ────
  { path: '', redirectTo: 'cliente/home', pathMatch: 'full' },

  // ──── CLIENTE ────
  {
    path: 'cliente',
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
      { path: 'login', loadComponent: () => import('./pages/login/login-cliente.component').then(m => m.LoginClienteComponent) },
      { path: 'cardapio', loadComponent: () => import('./pages/cliente/cardapio/cardapio.component').then(m => m.CardapioComponent), canActivate: [AuthGuard, ClienteGuard, CaixaAbertoGuard] },
      { path: 'acompanhamento/:id', loadComponent: () => import('./pages/cliente/acompanhamento/acompanhamento.component').then(m => m.AcompanhamentoComponent), canActivate: [AuthGuard, ClienteGuard] },
      { path: 'pedido/:id', loadComponent: () => import('./pages/cliente/pedido/pedido.component').then(m => m.PedidoComponent), canActivate: [AuthGuard, ClienteGuard] },

      // Ajuste: Provavelmente você terá um componente de lista para o histórico, separei de "pedido/:id"
      { path: 'meus-pedidos', loadComponent: () => import('./pages/cliente/pedido/pedido.component').then(m => m.PedidoComponent), canActivate: [AuthGuard, ClienteGuard] },
    ]
  },

  // ──── DONO / ADMINISTRAÇÃO ────
  {
    path: 'dono',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', loadComponent: () => import('./pages/login/login-dono.component').then(m => m.LoginDonoComponent) },
      { path: 'dashboard', loadComponent: () => import('./pages/dono/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard, DonoGuard] },

      // Operações de Caixa
      { path: 'caixa/abertura', loadComponent: () => import('./pages/caixa/abertura/abertura-caixa.component').then(m => m.AberturaCaixaComponent), canActivate: [AuthGuard, DonoGuard] },
      { path: 'caixa/fechamento', loadComponent: () => import('./pages/caixa/fechamento/fechamento-caixa.component').then(m => m.FechamentoCaixaComponent), canActivate: [AuthGuard, DonoGuard, CaixaAbertoGuard] },
      { path: 'caixa/reativar', loadComponent: () => import('./pages/caixa/reativar/reativar-caixa.component').then(m => m.ReativarCaixaComponent), canActivate: [AuthGuard, DonoGuard] },
      { path: 'caixa/pagamento/:id', loadComponent: () => import('./pages/caixa/pagamento/pagamento.component').then(m => m.PagamentoComponent), canActivate: [AuthGuard, DonoGuard] },

      // Cozinha
      { path: 'cozinha/painel', loadComponent: () => import('./pages/cozinha/painel/painel-cozinha.component').then(m => m.PainelCozinhaComponent), canActivate: [AuthGuard, DonoGuard, CaixaAbertoGuard] },

      // Comandas (Adicionado para bater com o botão do Dashboard)
      { path: 'comandas', loadComponent: () => import('./pages/comanda/comanda-detalhe.component').then(m => m.ComandaDetalheComponent), canActivate: [AuthGuard, DonoGuard] },
      { path: 'comanda/:id', loadComponent: () => import('./pages/comanda/comanda-detalhe.component').then(m => m.ComandaDetalheComponent), canActivate: [AuthGuard, DonoGuard] },

      // Relatórios (Adicionado para bater com o botão do Dashboard)
      //{ path: 'relatorios/hoje', loadComponent: () => import('./pages/relatorios/relatorio-hoje/relatorio-hoje.component').then(m => m.RelatorioHojeComponent), canActivate: [AuthGuard, DonoGuard] },
    ]
  },

  // ──── TELAS PÚBLICAS DE BLOQUEIO ────
  // Ajuste: A tela de bloqueio deve ser o CaixaFechadoComponent (aviso aos clientes), não a ação de fechar do dono.
  { path: 'caixa/fechado', loadComponent: () => import('./pages/caixa/fechamento/fechamento-caixa.component').then(m => m.FechamentoCaixaComponent) },
  { path: 'caixa/pausado', loadComponent: () => import('./pages/caixa/pausado/caixa-pausado.component').then(m => m.CaixaPausadoComponent) },

  // ──── FALLBACK (Página não encontrada) ────
  { path: '**', redirectTo: 'cliente/home' },
];
