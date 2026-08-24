// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, NavbarComponent, ConfirmModalComponent],
  templateUrl: './app.component.html', // <- O HTML fica só isso!
  styles: './app.component.css', // <- O CSS fica só isso!],
})
export class AppComponent {
  title = 'FilaCerta';
}
