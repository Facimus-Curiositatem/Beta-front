import { Component, ChangeDetectionStrategy, inject, input, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PoolService } from '../../services/pool.service';
import { TramoNavegacion } from '../../models/navegacion.model';
import { RutaNavegacionComponent } from '../ruta-navegacion/ruta-navegacion.component';

@Component({
  selector: 'app-pool-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RutaNavegacionComponent],
  templateUrl: './pool-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PoolFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly poolService = inject(PoolService);
  private readonly router = inject(Router);

  procesoId = input.required<string>();
  id = input<string>();
  tramos = input<TramoNavegacion[]>([]);

  protected readonly tiposParticipante = ['EMPRESA', 'CLIENTE', 'PROVEEDOR', 'SISTEMA_EXTERNO'];
  protected readonly editing = computed(() => this.id() !== undefined);
  protected readonly saving = signal(false);
  protected readonly message = signal('');

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipoParticipante: ['EMPRESA', Validators.required],
    cajaNegra: [false]
  });

  ngOnInit(): void {
    if (this.editing()) {
      this.poolService.obtener(Number(this.id())).subscribe({
        next: pool => {
          this.form.patchValue({
            nombre: pool.nombre,
            tipoParticipante: pool.tipoParticipante,
            cajaNegra: pool.cajaNegra
          });
        },
        error: (err: HttpErrorResponse) => {
          this.message.set(err.error?.message ?? 'No fue posible cargar el pool');
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.message.set('');
    const body = this.form.getRawValue();

    const request$ = this.editing()
      ? this.poolService.editar(Number(this.id()), body)
      : this.poolService.crear(Number(this.procesoId()), body);

    request$.subscribe({
      next: () => this.router.navigate(['/procesos', this.procesoId(), 'pools']),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.message ?? 'No fue posible guardar el pool');
      }
    });
  }
}
