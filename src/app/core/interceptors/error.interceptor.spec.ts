import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AUTH_LOGIN_ENDPOINT } from '../auth/auth.constants';
import { AuthService } from '../auth/auth.service';
import { ApiError } from '../services/api-error';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  const authService = { clearSession: vi.fn() };
  const router = { url: '/dashboard', navigate: vi.fn() };
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    authService.clearSession.mockReset();
    router.navigate.mockReset();
    router.url = '/dashboard';

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should return a safe message for invalid credentials', () => {
    let receivedError: unknown;
    http.post(AUTH_LOGIN_ENDPOINT, {}).subscribe({
      error: (error: unknown) => (receivedError = error),
    });

    httpTesting
      .expectOne(AUTH_LOGIN_ENDPOINT)
      .flush({ stackTrace: 'backend details' }, { status: 401, statusText: 'Unauthorized' });

    expect(receivedError).toBeInstanceOf(ApiError);
    expect((receivedError as ApiError).message).toBe('Adresse e-mail ou mot de passe incorrect.');
    expect((receivedError as ApiError).message).not.toContain('backend details');
    expect(authService.clearSession).toHaveBeenCalledOnce();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should clear the session and redirect after a protected 401 response', () => {
    const endpoint = `${environment.apiUrl}/api/products`;
    http.get(endpoint).subscribe({ error: () => undefined });

    httpTesting.expectOne(endpoint).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authService.clearSession).toHaveBeenCalledOnce();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard' },
    });
  });

  it('should normalize backend server errors', () => {
    const endpoint = `${environment.apiUrl}/api/products`;
    let receivedError: unknown;
    http.get(endpoint).subscribe({ error: (error: unknown) => (receivedError = error) });

    httpTesting.expectOne(endpoint).flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(receivedError).toBeInstanceOf(ApiError);
    expect((receivedError as ApiError).status).toBe(500);
    expect((receivedError as ApiError).message).toContain('erreur interne');
  });

  it('should expose the safe business message returned by the API', () => {
    const endpoint = `${environment.apiUrl}/api/stock-movements/products/12/outbound`;
    let receivedError: unknown;
    http.post(endpoint, { quantity: 20 }).subscribe({
      error: (error: unknown) => (receivedError = error),
    });

    httpTesting.expectOne(endpoint).flush(
      {
        message: 'Stock insuffisant pour le produit avec l’identifiant : 12',
        fieldErrors: { quantity: 'La quantité demandée dépasse le stock disponible' },
        stackTrace: 'never exposed',
      },
      { status: 400, statusText: 'Bad Request' },
    );

    expect((receivedError as ApiError).message).toBe(
      'Stock insuffisant pour le produit avec l’identifiant : 12',
    );
    expect((receivedError as ApiError).fieldErrors).toEqual({
      quantity: 'La quantité demandée dépasse le stock disponible',
    });
    expect((receivedError as ApiError).message).not.toContain('never exposed');
  });
});
