import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  HostListener,
  ElementRef,
  ViewChild,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ModalService, ModalConfig, ModalTipo } from '../../../core/services/modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  private readonly modalService = inject(ModalService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('botaoConfirmar') botaoConfirmar?: ElementRef<HTMLButtonElement>;

  config: ModalConfig | null = null;
  saindo = false;

  ngOnInit(): void {
    this.modalService.modal$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        // ⚠️ FILTRA null — só reage a novas aberturas
        filter((c): c is ModalConfig => c !== null),
      )
      .subscribe((config) => {
        this.config = config;
        this.saindo = false;
        document.body.style.overflow = 'hidden';
        this.cdr.markForCheck();

        // Auto-focus
        setTimeout(() => this.botaoConfirmar?.nativeElement?.focus(), 50);
      });
  }

  get tipoEfetivo(): ModalTipo {
    return this.config?.tipo ?? 'aviso';
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.config && !this.saindo) {
      this.fechar();
    }
  }

  confirmar(): void {
    if (!this.config) return;
    const cb = this.config.onConfirm;
    this.fechar();
    // Executa depois que fechar
    setTimeout(() => cb(), 100);
  }

  fechar(): void {
    if (this.saindo) return;
    this.saindo = true;
    this.cdr.markForCheck();

    // Delay só pra animação de saída
    setTimeout(() => {
      this.config = null;
      this.saindo = false;
      document.body.style.overflow = '';
      this.cdr.markForCheck();
    }, 200);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.fechar();
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
