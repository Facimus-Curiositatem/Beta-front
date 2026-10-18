import { Component, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { InvitacionService } from '../../services/invitacion.service';
import { AceptarInvitacionRequest } from '../../models/aceptar-invitacion-request';

@Component({
  selector: 'app-aceptar-invitacion',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './aceptar-invitacion.component.html',
  styleUrl: './aceptar-invitacion.component.css',
})
export class AceptarInvitacionComponent {
  private fb = inject(FormBuilder);
  private service = inject(InvitacionService);
  private route = inject(ActivatedRoute);

  token = this.route.snapshot.paramMap.get('token') ?? '';
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

    this.service.accept(this.token, request).subscribe({
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