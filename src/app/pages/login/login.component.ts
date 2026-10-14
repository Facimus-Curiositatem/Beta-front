import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LoginRequest } from '../../models/auth.model';
import { ProblemDetail } from '../../models/problem-detail.model';
import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/token.service';

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
    // La validacion de TypeScript es mas estricta que type="email": exige la @ y el dominio.
    email: new FormControl('', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]),
    password: new FormControl('', [Validators.required]),
  });

  cargando = false;
  mensajeError: string | null = null;

  ngOnInit(): void {
    // Quien ya tiene sesion no necesita ver el login.
    if (this.tokenService.hayToken()) {
      this.router.navigate(['/home']);
    }
  }

  iniciarSesion(): void {
    if (!this.loginForm.valid || this.cargando) {
      return;
    }
    const formValue = this.loginForm.value;
    const credenciales: LoginRequest = {
      email: formValue.email ?? '',
      password: formValue.password ?? '',
    };
    this.cargando = true;
    this.mensajeError = null;
    this.authService.login(credenciales).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        this.tokenService.guardar(respuesta.accessToken, respuesta.usuario);
        this.router.navigate(['/home']);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.mensajeError = this.mensajePara(err);
      },
    });
  }

  private mensajePara(err: HttpErrorResponse): string {
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    // HU-03: mensaje generico, sin revelar si el correo existe.
    if (err.status === 401) return 'Correo o contraseña incorrectos.';
    const problema = err.error as ProblemDetail | null;
    return problema?.detail ?? 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
}
