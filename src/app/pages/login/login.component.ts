import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/token.service';
import { mensajeDeError } from '../../utils/mensaje-error';

/** HU-03: inicio de sesion con correo y contrasena. */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  cargando = false;
  error: string | null = null;

  ngOnInit(): void {
    if (this.tokenService.hayToken()) {
      this.router.navigate(['/procesos']);
    }
  }

  iniciarSesion(): void {
    if (this.loginForm.invalid || this.cargando) {
      return;
    }
    this.cargando = true;
    this.error = null;
    const formValue = this.loginForm.value;
    this.authService
      .login({ email: formValue.email ?? '', password: formValue.password ?? '' })
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (respuesta) => {
          this.tokenService.guardar(respuesta.accessToken, respuesta.usuario);
          this.router.navigate(['/procesos']);
        },
        // HU-03: mensaje generico, sin revelar si el correo existe (el backend ya responde asi).
        error: (err: HttpErrorResponse) => {
          this.error = err.status === 401 ? 'Correo o contrasena incorrectos.' : mensajeDeError(err);
        },
      });
  }
}
