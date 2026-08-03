// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`, // <- O HTML fica só isso!
  styles: [`
    :host {
      display: block;
      min-height: 100dvh;
      background-color: #f9fafb;
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
      -webkit-tap-highlight-color: transparent;
      -webkit-text-size-adjust: 100%;
    }
  `],
})
export class AppComponent {}
