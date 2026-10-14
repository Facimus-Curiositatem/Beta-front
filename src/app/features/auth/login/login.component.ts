import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LoginRequest, ProblemDetail } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';

/** Estados visibles de una operación asíncrona (el éxito navega a /home). */
type Estado = 'idle' | 'loading' | 'error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly estado = signal<Estado>('idle');
  readonly mensajeError = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const credenciales: LoginRequest = this.form.getRawValue();
    this.estado.set('loading');
    this.auth.login(credenciales).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err: HttpErrorResponse) => {
        this.estado.set('error');
        this.mensajeError.set(this.mensajePara(err));
      },
    });
  }

  private mensajePara(err: HttpErrorResponse): string {
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    if (err.status === 401) return 'Correo o contraseña incorrectos.';
    const problema = err.error as ProblemDetail | null;
    return problema?.detail ?? 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
}
