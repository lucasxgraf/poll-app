import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./core/layout/header/header";
import { Footer } from "./core/layout/footer/footer";
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Toast } from "./shared/ui/toast/toast";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, Footer, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);

  protected readonly title = signal('poll-app');

showShell = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => !(event as NavigationEnd).urlAfterRedirects.includes('login'))
    ),
    { initialValue: true }
  );
}
