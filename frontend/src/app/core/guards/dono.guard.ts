import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class DonoGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isDono()) {
      return true;
    }
    if (this.auth.isCliente()) {
      this.router.navigate(['/cliente/home']);
      return false;
    }
    this.router.navigate(['/dono/login']);
    return false;
  }
}
