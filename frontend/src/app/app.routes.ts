import { Routes } from '@angular/router';
import { rolesFor } from './constants/navigation.constants';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'list-tickets',
        loadComponent: () =>
          import('./pages/tickets/ticket-list/ticket-list').then((m) => m.TicketList),
      },
      {
        path: 'new-ticket',
        canActivate: [roleGuard],
        data: { roles: rolesFor('/new-ticket') },
        loadComponent: () =>
          import('./pages/tickets/ticket-form/ticket-form').then((m) => m.TicketForm),
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./pages/tickets/ticket-detail/ticket-detail').then((m) => m.TicketDetail),
      },
      {
        path: 'triage',
        canActivate: [roleGuard],
        data: { roles: rolesFor('/triage') },
        loadComponent: () => import('./pages/triage/triage').then((m) => m.Triage),
      },
      {
        path: 'attendance',
        canActivate: [roleGuard],
        data: { roles: rolesFor('/attendance') },
        loadComponent: () => import('./pages/attendance/attendance').then((m) => m.Attendance),
      },
      {
        path: 'attendance/:id',
        canActivate: [roleGuard],
        data: { roles: rolesFor('/attendance') },
        loadComponent: () =>
          import('./pages/attendance/attendance-detail/attendance-detail').then(
            (m) => m.AttendanceDetail,
          ),
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: rolesFor('/admin') },
        loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
