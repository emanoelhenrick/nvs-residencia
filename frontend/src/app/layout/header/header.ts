import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export interface UsuarioHeader {
  nome: string;
  nivel: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  // readonly titulo = input('Central de operações');
  // readonly usuario = input.required<UsuarioHeader>();
  // readonly notificacoes = input(0);
  // readonly abrirNotificacoes = output<void>();
  // protected readonly rotuloSino = computed(() => {
  //   const n = this.notificacoes();
  //   return n > 0 ? `Notificações: ${n} não lidas` : 'Notificações';
  // });
}
