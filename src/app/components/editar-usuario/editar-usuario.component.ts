import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UsuarioService } from '../../services/usuario.service';
import { ActualizarUsuarioRequest, RolAcceso, UsuarioResponse } from '../../models/usuario.model';

@Component({
  selector: 'app-editar-usuario',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarUsuarioComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuarioService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();
  roles: RolAcceso[] = ['ADMINISTRADOR', 'EDITOR', 'SOLO_LECTURA'];
  usuario = signal<UsuarioResponse | null>(null);
  message = signal('');

  form = this.fb.nonNullable.group({
    rolAcceso: ['EDITOR' as RolAcceso, Validators.required],
    activo: [true],
  });

  ngOnInit(): void {
    this.service.get(Number(this.id())).subscribe({
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

    this.service.update(Number(this.id()), request).subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: (err: HttpErrorResponse) =>
        this.message.set(err.error?.detail ?? 'No fue posible actualizar el usuario'),
    });
  }
}