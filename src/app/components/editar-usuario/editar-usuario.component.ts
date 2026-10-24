import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UsuarioService } from '../../services/usuario.service';
import { UsuarioResponse } from '../../models/usuario.model';
import { ActualizarUsuarioRequest } from '../../models/usuario.model';
import { RolAcceso } from '../../models/usuario.model';

@Component({
  selector: 'app-editar-usuario',
  imports: [ReactiveFormsModule, NgFor],
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.css',
})
export class EditarUsuarioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(UsuarioService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id = Number(this.route.snapshot.paramMap.get('id'));
  roles: RolAcceso[] = ['ADMINISTRADOR', 'EDITOR', 'SOLO_LECTURA'];
  usuario = signal<UsuarioResponse | null>(null);
  message = signal('');

  form = this.fb.nonNullable.group({
    rolAcceso: ['EDITOR' as RolAcceso, Validators.required],
    activo: [true],
  });

  ngOnInit(): void {
    this.service.get(this.id).subscribe({
      next: (u) => {
        this.usuario.set(u);
        this.form.patchValue({ rolAcceso: u.rolAcceso, activo: u.activo });
      },
      error: (err: HttpErrorResponse) =>
        this.message.set(err.error?.detail ?? 'No fue posible cargar el usuario'),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const request: ActualizarUsuarioRequest = this.form.getRawValue();

    this.service.update(this.id, request).subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: (err: HttpErrorResponse) =>
        this.message.set(err.error?.detail ?? 'No fue posible actualizar el usuario'),
    });
  }
}