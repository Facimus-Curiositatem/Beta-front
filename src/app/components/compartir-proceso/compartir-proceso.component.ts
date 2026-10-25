import { Subscription } from 'rxjs';
import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoCompartidoService } from '../../services/proceso-compartido.service';
import { ProcesoCompartidoResponse } from '../../models/proceso-compartido.model';

@Component({
  selector: 'app-compartir-proceso',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './compartir-proceso.component.html'
})
export class CompartirProcesoComponent {
  private readonly service = inject(ProcesoCompartidoService);
  readonly id = input.required<string>();
  readonly compartidos = signal<ProcesoCompartidoResponse[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    empresaInvitadaId: [0, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]]
  });
  private carga?: Subscription;
  ngOnDestroy(): void {
    this.carga?.unsubscribe();
  }
  ngOnChanges(): void {
    this.cargar();
  }
  cargar(): void {
    this.carga?.unsubscribe();
    this.loading.set(true);
    this.message.set('');
    this.compartidos.set([]);
    this.carga = this.service.listarCompartidosPorMi(Number(this.id())).subscribe({
      next: (data) => {
        this.compartidos.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible cargar las empresas invitadas');
      }
    });
  }
  compartir(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.message.set('');
    this.service.compartir(Number(this.id()), this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset();
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible compartir el proceso');
      }
    });
  }
  revocar(compartido: ProcesoCompartidoResponse): void {
    if (this.saving()) return;
    if (!confirm(`¿Revocar el acceso de ${compartido.empresaInvitada}?`)) return;
    this.saving.set(true);
    this.message.set('');
    // El endpoint recibe la empresa invitada, no el ID del registro compartido.
    this.service.revocar(Number(this.id()), compartido.empresaInvitadaId).subscribe({
      next: () => {
        this.saving.set(false);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible revocar el acceso');
      }
    });
  }
}
