import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IUser, Role } from '../../models';
import { clearToken, decodeToken, userFromStoredToken, writeToken } from './token.storage';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly _router = inject(Router);
  private readonly _user = signal<IUser | null>(userFromStoredToken());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly role = computed<Role | ''>(() => this._user()?.role ?? '');

  start(token: string): boolean {
    const user = decodeToken(token);
    if (!user) return false;
    writeToken(token);
    this._user.set(user);
    return true;
  }

  end(): void {
    clearToken();
    this._user.set(null);
    this._router.navigateByUrl('/login');
  }
}
