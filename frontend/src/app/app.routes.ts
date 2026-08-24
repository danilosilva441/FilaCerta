import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'cliente/cardapio', pathMatch: 'full' },
  {
    path: 'cliente/cardapio',
    loadComponent: () =>
      import('./pages/cliente/cardapio/cardapio').then((m) => m.CardapioComponent),
  },
  {
    path: 'cliente/acompanhamento/:id',
    loadComponent: () =>
      import('./pages/cliente/acompanhamento/acompanhamento').then(
        (m) => m.AcompanhamentoComponent,
      ),
  },
  {
    path: 'cozinha/painel',
    loadComponent: () => import('./pages/cozinha/painel/painel').then((m) => m.PainelComponent),
  },
  {
    path: 'caixa/painel',
    loadComponent: () =>
      import('./pages/caixa/painel-caixa/painel-caixa').then((m) => m.PainelCaixaComponent),
  },
];
