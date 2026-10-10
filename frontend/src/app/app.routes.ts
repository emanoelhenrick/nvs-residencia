// app.routes.ts
import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Shell } from './layout/shell/shell';
import { NewTicket } from './pages/new-ticket/new-ticket';
import { Triage } from './pages/triage/triage';
import { Attendance } from './pages/attendance/attendance';
import { TicketList } from './pages/ticket-list/ticket-list';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'list-tickets',
        component: TicketList,
      },
      {
        path: 'new-ticket',
        component: NewTicket,
      },
      {
        path: 'triage',
        component: Triage,
      },
      {
        path: 'attendance',
        component: Attendance,
      },
    ],
  },
  //   {
  //     path: 'login',
  //     loadComponent: () => import('./core/auth/login.page').then(m => m.LoginPage),
  //   },
];
