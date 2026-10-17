import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService } from '../layout.service';

export interface NavItem {
  label: string;
  route: string;
  icon?: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Lista de Chamados', route: '/list-tickets', icon: 'confirmation_number' },
  { label: 'Abrir chamado', route: '/new-ticket', icon: 'add_circle' },
  { label: 'Triagem', route: '/triage', icon: 'filter_alt' },
  { label: 'Atendimento', route: '/attendance', icon: 'support_agent' },
];

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar {
  protected readonly layout = inject(LayoutService);
  protected readonly items = NAV_ITEMS;
}
