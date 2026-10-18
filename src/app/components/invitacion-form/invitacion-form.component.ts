import { Component, inject, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InvitacionService } from '../../services/invitacion.service';
import { InvitacionRequest } from '../../models/invitacion-request';
import { InvitacionResponse } from '../../models/invitacion-response';
import { RolAcceso } from '../../models/rol-acceso';

@Component({
  selector: 'app-invitacion-form',
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './invitacion-form.component.html',
  styleUrl: './invitacion-form.component.css',
})
export class InvitacionFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(InvitacionService);

  roles: RolAcceso[] = ['ADMINISTRADOR', 'EDITOR', 'SOLO_LECTURA'];
  invitacion = signal<InvitacionResponse | null>(null);
  message = signal('');

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