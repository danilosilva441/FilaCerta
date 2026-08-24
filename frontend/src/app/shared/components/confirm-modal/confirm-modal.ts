import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from '../../../core/services/modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
})
export class ConfirmModalComponent implements OnInit {
  config: ModalConfig | null = null;

  constructor(
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.modalService.modal$.subscribe((config) => {
      this.config = config;
      this.cdr.detectChanges();
    });
  }

  confirmar(): void {
    if (this.config) {
      this.config.onConfirm();
      this.fechar();
    }
  }

  fechar(): void {
    this.modalService.fechar();
  }
}
