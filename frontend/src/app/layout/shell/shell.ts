import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiService } from '../../core/ui/ui.service';
import { Header } from '../header/header';
import { SideBar } from '../side-bar/side-bar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, SideBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly ui = inject(UiService);
}
