import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ProcesoRequest } from '../../models/proceso.model';
import { ProcesoService } from '../../service/proceso.service';
import { mensajeDeError } from '../../utils/mensaje-error';

/** HU-04 y HU-05: un solo formulario para crear y editar los datos del proceso. */
@Component({
  selector: 'app-proceso-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './proceso-form.component.html',
  styleUrl: './proceso-form.component.scss',
})
export class ProcesoFormComponent implements OnInit {
  private procesoService = inject(ProcesoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  procesoForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.maxLength(150)]),
    descripcion: new FormControl('', [Validators.required]),
    categoria: new FormControl('', [Validators.required, Validators.maxLength(100)]),
  });

  procesoId: number | null = null;
  isEdit = false;
  guardando = false;
  error: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.procesoId = Number(id);
      this.isEdit = true;
      this.procesoService.obtener(this.procesoId).subscribe({
        next: (detalle) => this.procesoForm.patchValue(detalle.proceso),
        error: (err: HttpErrorResponse) => (this.error = mensajeDeError(err)),
      });
    }
  }

  guardar(): void {
    if (this.procesoForm.invalid || this.guardando) {
      this.procesoForm.markAllAsTouched();
      return;
    }
    const formValue = this.procesoForm.value;
    const proceso: ProcesoRequest = {
      nombre: formValue.nombre?.trim() ?? '',
      descripcion: formValue.descripcion?.trim() ?? '',
      categoria: formValue.categoria?.trim() ?? '',
    };
    this.guardando = true;
    this.error = null;
    const peticion = this.isEdit
      ? this.procesoService.editar(this.procesoId!, proceso)
      : this.procesoService.crear(proceso);
    peticion.pipe(finalize(() => (this.guardando = false))).subscribe({
      next: () => this.router.navigate(['/procesos']),
      // Ej.: 409 si el nombre ya existe en la empresa (HU-04).
      error: (err: HttpErrorResponse) => (this.error = mensajeDeError(err)),
    });
  }
}
