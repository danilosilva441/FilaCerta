import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ModalService } from '../../../core/services/modal.service';
import { ModalConfig, ModalTipo } from '../../../core/models/modal.config';

/** Precisa bater com o `duration-200` do .modal-card / .modal-backdrop. */
const DURACAO_SAIDA = 200;

/** Janela em que cliques no backdrop são ignorados (ghost click do touch). */
const JANELA_GHOST_CLICK = 300;

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
  styleUrls: ['./confirm-modal.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent implements OnInit {
  private readonly modalService = inject(ModalService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('modalCard') modalCard?: ElementRef<HTMLElement>;
  @ViewChild('botaoConfirmar') botaoConfirmar?: ElementRef<HTMLButtonElement>;

  config: ModalConfig | null = null;
  saindo = false;

  private tempoAbertura = 0;
  private focoAnterior: HTMLElement | null = null;

  /** Cada abertura incrementa; timeouts de uma geração antiga se auto-descartam. */
  private geracao = 0;
  private timerFechar?: ReturnType<typeof setTimeout>;
  private timerFoco?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.modalService.modal$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((config) => {
      if (config) {
        this.abrir(config);
      } else if (this.config && !this.saindo) {
        // Fechado por fora (algum outro componente chamou o serviço).
        this.fechar(false);
      }
    });

    this.destroyRef.onDestroy(() => {
      clearTimeout(this.timerFechar);
      clearTimeout(this.timerFoco);
      this.liberarScroll();
    });
  }

  get tipoEfetivo(): ModalTipo {
    return this.config?.tipo ?? 'aviso';
  }

  // ===============================================================
  // ABRIR / FECHAR
  // ===============================================================
  private abrir(config: ModalConfig): void {
    // Um modal novo chegou: cancela a saída do anterior.
    clearTimeout(this.timerFechar);
    clearTimeout(this.timerFoco);

    this.geracao++;
    const geracao = this.geracao;

    this.config = config;
    this.saindo = false;
    this.tempoAbertura = Date.now();
    this.focoAnterior = document.activeElement as HTMLElement | null;

    this.travarScroll();
    this.cdr.markForCheck();

    this.timerFoco = setTimeout(() => {
      if (geracao !== this.geracao) return;
      this.botaoConfirmar?.nativeElement?.focus();
    }, 50);
  }

  fechar(notificarServico = true): void {
    if (!this.config || this.saindo) return;

    this.saindo = true;
    this.cdr.markForCheck();

    const geracao = this.geracao;

    this.timerFechar = setTimeout(() => {
      // Se outro modal abriu nesse meio tempo, não mexe no estado dele.
      if (geracao !== this.geracao) return;

      this.config = null;
      this.saindo = false;
      this.liberarScroll();
      this.devolverFoco();
      this.cdr.markForCheck();
    }, DURACAO_SAIDA);

    if (notificarServico) {
      this.modalService.fechar();
    }
  }

  confirmar(): void {
    const config = this.config;
    if (!config) return;

    const acao = config.onConfirm;

    // `fechar()` marca `saindo`, e o backdrop ganha `pointer-events-none`,
    // então não existe risco de ghost click: a ação pode rodar na hora.
    this.fechar();

    if (typeof acao === 'function') {
      acao();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (Date.now() - this.tempoAbertura < JANELA_GHOST_CLICK) return;
    if (event.target !== event.currentTarget) return;
    this.fechar();
  }

  // ===============================================================
  // TECLADO — Esc fecha, Tab fica preso no card
  // ===============================================================
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.config || this.saindo) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.fechar();
      return;
    }

    if (event.key !== 'Tab') return;

    const card = this.modalCard?.nativeElement;
    if (!card) return;

    const focaveis = Array.from(
      card.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), ' +
          'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null);

    if (focaveis.length === 0) {
      event.preventDefault();
      return;
    }

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    const ativo = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (ativo === primeiro || !card.contains(ativo)) {
        event.preventDefault();
        ultimo.focus();
      }
    } else if (ativo === ultimo || !card.contains(ativo)) {
      event.preventDefault();
      primeiro.focus();
    }
  }

  // ===============================================================
  // SCROLL / FOCO
  // ===============================================================
  private travarScroll(): void {
    // Compensa a barra de rolagem para o layout não pular no desktop.
    const barra = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (barra > 0) {
      document.body.style.paddingRight = `${barra}px`;
    }
  }

  private liberarScroll(): void {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  private devolverFoco(): void {
    const alvo = this.focoAnterior;
    this.focoAnterior = null;
    if (alvo && document.contains(alvo)) {
      alvo.focus({ preventScroll: true });
    }
  }
}
