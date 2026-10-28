import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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