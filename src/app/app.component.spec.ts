import { TokenService } from './services/token.service';
import { Router } from '@angular/router';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();
  });

  it('debe crearse', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('debe contener router-outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});

describe('AppComponent cierre de sesión', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });
  it('cierra sesión y vuelve a login aunque falle el servidor', () => {
    const f = TestBed.createComponent(AppComponent);
    localStorage.setItem('accessToken', 'token');
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    f.componentInstance.cerrarSesion();
    f.componentInstance.cerrarSesion();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/logout')
      .flush({}, { status: 500, statusText: 'Error' });
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(nav).toHaveBeenCalledWith(['/login']);
    expect(f.componentInstance.closing()).toBeFalse();
  });
});

describe('Menú de sesión con OnPush', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
  });
  afterEach(() => localStorage.clear());
  it('actualiza el menú al recibir o eliminar el token fuera de un clic del menú', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.autoDetectChanges();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
    const token =
      'h.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600, rol: 'ADMINISTRADOR' })) + '.s';
    TestBed.inject(TokenService).setToken(token);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nav')).not.toBeNull();
    TestBed.inject(TokenService).removeToken();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });
});
