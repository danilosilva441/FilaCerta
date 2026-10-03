import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lgpd-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!aceito()) {
      <!-- ============================================================
           BANNER LGPD — Fixo acima da bottom-nav
           Safe-area respeitada, sem colidir com a navegação
           ============================================================ -->
      <div
        class="lgpd-banner"
        role="region"
        aria-labelledby="lgpd-title"
        aria-describedby="lgpd-desc"
      >
        <div class="lgpd-banner-inner">
          <!-- ÍCONE + TEXTO -->
          <div class="lgpd-banner-content">
            <div class="lgpd-icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-5 h-5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
            </div>

            <div class="lgpd-text">
              <p id="lgpd-title" class="lgpd-title">Sua Privacidade em Primeiro Lugar</p>
              <p id="lgpd-desc" class="lgpd-desc">
                Usamos apenas o seu nome ou apelido para chamar o seu pedido. Não coletamos CPF ou
                dados sensíveis, e os registros são anonimizados após o fechamento do caixa.
              </p>
            </div>
          </div>

          <!-- BOTÃO -->
          <button
            type="button"
            (click)="aceitarTermos()"
            class="lgpd-btn"
            aria-label="Aceitar termos de privacidade e fechar aviso"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-4 h-4"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Entendi e Concordo</span>
          </button>
        </div>
      </div>
    }
  `,
})
export class LgpdBannerComponent {
  /**
   * Flag reativa: `true` = usuário já aceitou, banner escondido.
   * Persistido em localStorage sob a chave `filacerta_lgpd_aceito`.
   */
  readonly aceito = signal<boolean>(localStorage.getItem('filacerta_lgpd_aceito') === 'true');

  /**
   * Grava o aceite no localStorage e esconde o banner.
   * Idempotente — pode ser chamado múltiplas vezes sem problema.
   */
  aceitarTermos(): void {
    try {
      localStorage.setItem('filacerta_lgpd_aceito', 'true');
    } catch {
      // Modo privado do Safari / cota cheia: falha silenciosa,
      // o aceite vale só para a sessão atual.
    }
    this.aceito.set(true);
  }
}
