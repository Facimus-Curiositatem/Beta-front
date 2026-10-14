import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/token.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  get usuario(): Usuario | null {
    return this.tokenService.obtenerUsuario();
  }

  cerrarSesion(): void {
    // Sin estado en el servidor: aunque el logout falle, la sesion local se borra igual.
    this.authService
      .logout()
      .pipe(
        finalize(() => {
          this.tokenService.borrar();
          this.router.navigate(['/login']);
        }),
      )
      .subscribe({ error: () => {} });
  }
}
