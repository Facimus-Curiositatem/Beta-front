import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InvitacionService } from '../../services/invitacion.service';
import { AceptarInvitacionRequest } from '../../models/invitacion.model';

@Component({
  selector: 'app-aceptar-invitacion',
  imports: [ReactiveFormsModule],
  templateUrl: './aceptar-invitacion.component.html',
  styleUrl: './aceptar-invitacion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AceptarInvitacionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InvitacionService);

  readonly token = input.required<string>();
  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  message = signal('');

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const request: AceptarInvitacionRequest = this.form.getRawValue();
    this.status.set('loading');

    this.service.accept(this.token(), request).subscribe({
      next: () => {
        this.message.set('');
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible aceptar la invitación');
        this.status.set('error');
      },
    });
  }
}