import { Component, ChangeDetectionStrategy, inject, input, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ArcoService } from '../../services/arco.service';
import { NodoFlujoService } from '../../services/nodo-flujo.service';
import { NodoFlujo } from '../../models/nodo-flujo.model';

@Component({
  selector: 'app-arco-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './arco-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArcoFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly arcoService = inject(ArcoService);
  private readonly nodoFlujoService = inject(NodoFlujoService);
  private readonly router = inject(Router);

  poolId = input.required<string>();
  arcoId = input<string>();

  protected readonly nodos = signal<NodoFlujo[]>([]);
  protected readonly editing = computed(() => this.arcoId() !== undefined);
  protected readonly saving = signal(false);
  protected readonly message = signal('');

  protected readonly form = this.fb.group({
    origenId: this.fb.control<number | null>(null, Validators.required),
    destinoId: this.fb.control<number | null>(null, Validators.required),
    etiqueta: this.fb.nonNullable.control(''),
    condicion: this.fb.nonNullable.control('')
  });

  ngOnInit(): void {
    this.nodoFlujoService.listarPorPool(Number(this.poolId())).subscribe({
      next: data => this.nodos.set(data),
      error: () => this.message.set('No fue posible cargar los nodos del pool')
    });

    if (this.editing()) {
      this.arcoService.obtener(Number(this.arcoId())).subscribe({
        next: arco => {
          this.form.patchValue({
            origenId: arco.origenId,
            destinoId: arco.destinoId,
            etiqueta: arco.etiqueta ?? '',
            condicion: arco.condicion ?? ''
          });
        },
        error: (err: HttpErrorResponse) => {
          this.message.set(err.error?.message ?? 'No fue posible cargar el arco');
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
    const { origenId, destinoId, etiqueta, condicion } = this.form.getRawValue();
    const body = {
      origenId: origenId!,
      destinoId: destinoId!,
      etiqueta: etiqueta || undefined,
      condicion: condicion || undefined
    };

    const request$ = this.editing()
      ? this.arcoService.editar(Number(this.arcoId()), body)
      : this.arcoService.crear(body);

    request$.subscribe({
      next: () => this.router.navigate(['/pools', this.poolId(), 'arcos']),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.message ?? 'No fue posible guardar el arco');
      }
    });
  }
}
