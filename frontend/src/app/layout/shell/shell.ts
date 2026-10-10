import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { SideBar } from '../side-bar/side-bar';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-shell',
  imports: [SideBar, Header, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly layout = inject(LayoutService);
}
