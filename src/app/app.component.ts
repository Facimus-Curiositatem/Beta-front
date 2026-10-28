import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Beta-front';
  readonly tokens = inject(TokenService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly closing = signal(false);
  cerrarSesion(): void {
    if (this.closing()) return;
    this.closing.set(true);
    const salir = () => {
      this.tokens.removeToken();
      this.closing.set(false);
      this.router.navigate(['/login']);
    };
    this.auth.logout().subscribe({ next: salir, error: salir });
  }
}
