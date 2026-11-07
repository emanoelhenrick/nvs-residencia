import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../../models';
import { SessionStore } from '../session/session.store';

export const authGuard: CanActivateFn = () =>
  inject(SessionStore).isLoggedIn() ? true : inject(Router).parseUrl('/login');

export const guestGuard: CanActivateFn = () =>
  inject(SessionStore).isLoggedIn() ? inject(Router).parseUrl('/dashboard') : true;

export const roleGuard: CanActivateFn = (route) => {
  const roles = (route.data['roles'] ?? []) as Role[];
  const role = inject(SessionStore).role();
  return role && roles.includes(role) ? true : inject(Router).parseUrl('/dashboard');
};
