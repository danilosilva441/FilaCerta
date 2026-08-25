import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaixaService } from '../../../core/services/caixa.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html', // ou apenas './home.html' dependendo de como você nomeou
})
export class HomeComponent implements OnInit {
  isAberto = false;
  carregando = true;

  constructor(private caixaService: CaixaService) {}

  ngOnInit(): void {
    this.verificarStatusLoja();
  }

  verificarStatusLoja(): void {
    // Consulta o mesmo endpoint que o dono usa para saber se o caixa tá aberto
    this.caixaService.buscarCaixaAtual().subscribe({
      next: (caixa) => {
        // Se retornar um caixa e o status for ABERTO, a loja tá on!
        this.isAberto = !!caixa && caixa.status === 'ABERTO';
        this.carregando = false;
      },
      error: () => {
        // Se der erro (ex: 404 sem caixa aberto), assume que tá fechado
        this.isAberto = false;
        this.carregando = false;
      },
    });
  }
}
