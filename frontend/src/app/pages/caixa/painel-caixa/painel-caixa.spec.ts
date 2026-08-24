import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelCaixa } from './painel-caixa';

describe('PainelCaixa', () => {
  let component: PainelCaixa;
  let fixture: ComponentFixture<PainelCaixa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelCaixa],
    }).compileComponents();

    fixture = TestBed.createComponent(PainelCaixa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
