import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard'; // <-- IMPORTANTE

export const routes: Routes = [
  // Rotas Públicas (Cliente)
  {
    path: '', // Home
    loadComponent: () => import('./pages/cliente/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'login', // A nossa nova tela de login
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'cliente/cardapio',
    loadComponent: () =>
      import('./pages/cliente/cardapio/cardapio').then((m) => m.CardapioComponent),
  },
  {
    path: 'cliente/acompanhamento/:codigo', // Acompanhamento de pedido
    loadComponent: () =>
      import('./pages/cliente/acompanhamento/acompanhamento').then(
        (m) => m.AcompanhamentoComponent,
      ),
  },

  // Rotas PROTEGIDAS (Dono / Funcionário)
  {
    path: 'caixa',
    canActivate: [authGuard], // <-- A MÁGICA AQUI! O Guarda fica na porta!
    children: [
      {
        path: 'painel',
        loadComponent: () =>
          import('./pages/caixa/painel-caixa/painel-caixa').then((m) => m.PainelCaixaComponent),
      },
    ],
  },
  {
    path: 'cozinha',
    canActivate: [authGuard], // <-- E AQUI TAMBÉM!
    children: [
      {
        path: 'painel',
        loadComponent: () =>
          import('./pages/cozinha/painel/fila-cozinha').then((m) => m.FilaCozinhaComponent),
      },
    ],
  },

  {
    path: 'estoque',
    canActivate: [authGuard], // <-- E AQUI TAMBÉM!
    children: [
      {
        path: 'painel',
        loadComponent: () =>
          import('./pages/admin/painel-produtos').then((m) => m.PainelProdutosComponent),
      },
    ],
  },

  // Redireciona qualquer rota que não existe para a Home
  { path: '**', redirectTo: '' },
];
