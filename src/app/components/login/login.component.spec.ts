import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });
  it('no envía formulario vacío', () => {
    const f = TestBed.createComponent(LoginComponent);
    f.detectChanges();
    f.componentInstance.submit();
    expect(f.nativeElement.querySelector('form')).toBeTruthy();
    TestBed.inject(HttpTestingController).expectNone('/api/v1/auth/login');
  });
  it('guarda sesión, evita doble envío y navega a procesos', () => {
    const f = TestBed.createComponent(LoginComponent);
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    f.detectChanges();
    for (const [name, value] of [
      ['email', 'sam@beta.co'],
      ['password', '123456']
    ]) {
      const input: HTMLInputElement = f.nativeElement.querySelector(`[formControlName="${name}"]`);
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    f.componentInstance.submit();
    f.componentInstance.submit();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/v1/auth/login');
    req.flush({ accessToken: 'jwt', usuario: {}, expiresIn: 3600, tokenType: 'Bearer' });
    expect(localStorage.getItem('accessToken')).toBe('jwt');
    expect(nav).toHaveBeenCalledWith(['/procesos']);
  });
  it('muestra detail del backend y permite reintentar', () => {
    const f = TestBed.createComponent(LoginComponent);
    f.detectChanges();
    for (const [name, value] of [
      ['email', 'sam@beta.co'],
      ['password', '123456']
    ]) {
      const input = f.nativeElement.querySelector(`[formControlName="${name}"]`);
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    f.componentInstance.submit();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/login')
      .flush({ detail: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Credenciales inválidas');
    expect(f.nativeElement.querySelector('button').disabled).toBeFalse();
  });
});
