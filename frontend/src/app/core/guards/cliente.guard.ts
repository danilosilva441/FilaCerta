import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class ClienteGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isCliente()) {
      return true;
    }
    if (this.auth.isDono()) {
      this.router.navigate(['/dono/dashboard']);
      return false;
    }
    this.router.navigate(['/cliente/login']);
    return false;
  }
}
