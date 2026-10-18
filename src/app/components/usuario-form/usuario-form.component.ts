import { Component, inject, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UsuarioService } from '../../services/usuario.service';
import { CrearUsuarioRequest } from '../../models/crear-usuario-request';
import { RolAcceso } from '../../models/rol-acceso';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css',
})
export class UsuarioFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(UsuarioService);
  private router = inject(Router);

  roles: RolAcceso[] = ['ADMINISTRADOR', 'EDITOR', 'SOLO_LECTURA'];
  message = signal('');

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rolAcceso: ['EDITOR' as RolAcceso, Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const request: CrearUsuarioRequest = this.form.getRawValue();

    this.service.create(request).subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: (err: HttpErrorResponse) =>
        this.message.set(err.error?.detail ?? 'No fue posible crear el usuario'),
    });
  }
}