import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EmpresaService } from '../../services/empresa.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-registro-empresa',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro-empresa.component.html'
})
export class RegistroEmpresaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly empresas = inject(EmpresaService);
  private readonly router = inject(Router);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly form = this.fb.nonNullable.group({
    nombreEmpresa: ['', Validators.required],
    nit: ['', Validators.required],
    correoContacto: ['', [Validators.required, Validators.email]],
    nombreAdmin: ['', Validators.required],
    emailAdmin: ['', [Validators.required, Validators.email]],
    passwordAdmin: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.message.set('');
    this.empresas.registrar(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible registrar la empresa');
      }
    });
  }
}
