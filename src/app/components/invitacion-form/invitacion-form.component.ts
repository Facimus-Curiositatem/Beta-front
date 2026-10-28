import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { InvitacionService } from '../../services/invitacion.service';
import { InvitacionRequest, InvitacionResponse } from '../../models/invitacion.model';
import { RolAcceso } from '../../models/usuario.model';

@Component({
  selector: 'app-invitacion-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './invitacion-form.component.html',
  styleUrl: './invitacion-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitacionFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InvitacionService);
  // Origen con el que el admin abrió la app (ej. http://10.43.99.76:4200), para que el enlace sirva desde otra máquina.
  private readonly origen = inject(DOCUMENT).location.origin;

  roles: RolAcceso[] = ['ADMINISTRADOR', 'EDITOR', 'SOLO_LECTURA'];
  invitacion = signal<InvitacionResponse | null>(null);
  message = signal('');

  protected readonly enlace = computed(() => {
    const invitacion = this.invitacion();
    return invitacion ? `${this.origen}/invitaciones/${encodeURIComponent(invitacion.token)}/aceptar` : '';
  });

  protected readonly enlaceCorreo = computed(() => {
    const invitacion = this.invitacion();
    if (!invitacion) return '';
    const asunto = 'Invitación para unirte a la empresa';
    const cuerpo = `Te invitaron con el rol ${invitacion.rolAcceso}.\n\n`
      + `Crea tu cuenta en este enlace:\n${this.enlace()}\n\n`
      + `El enlace vence: ${invitacion.fechaExpiracion}`;
    return `mailto:${encodeURIComponent(invitacion.email)}`
      + `?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  });

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    rolAcceso: ['EDITOR' as RolAcceso, Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const request: InvitacionRequest = this.form.getRawValue();

    this.service.create(request).subscribe({
      next: (data) => {
        this.invitacion.set(data);
        this.message.set('');
      },
      error: (err: HttpErrorResponse) =>
        this.message.set(err.error?.detail ?? 'No fue posible enviar la invitación'),
    });
  }
}