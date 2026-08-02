import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CaixaService, StatusCaixaResponse } from '../../../core/services/caixa.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-caixa-pausado',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './caixa-pausado.component.html',
  styleUrls: ['./caixa-pausado.component.css'],
})
export class CaixaPausadoComponent implements OnInit {
  status = signal<StatusCaixaResponse | null>(null);
  loading = signal(true);
  contador = signal(0);

  private intervalo: any;

  constructor(
    private caixaService: CaixaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarStatus();

    // Atualiza a cada 30 segundos
    this.intervalo = setInterval(() => {
      this.verificarStatus();
    }, 30000);
  }

  verificarStatus(): void {
    this.loading.set(true);
    this.caixaService.getStatus().subscribe({
      next: (status) => {
        this.status.set(status);
        this.loading.set(false);

        // Se já reativou, redireciona para cardápio
        if (status.podePedir) {
          this.router.navigate(['/cardapio']);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  irParaLoginDono(): void {
    this.router.navigate(['/login/dono']);
  }

  verificarNovamente(): void {
    this.verificarStatus();
  }

  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }
}
