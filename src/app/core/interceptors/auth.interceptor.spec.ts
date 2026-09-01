import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AUTH_LOGIN_ENDPOINT } from '../auth/auth.constants';
import { AuthService } from '../auth/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const accessToken = signal<string | null>('jwt-access-token');
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    accessToken.set('jwt-access-token');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { accessToken: accessToken.asReadonly() } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should add a Bearer token to authenticated StockFlow API requests', () => {
    http.get(`${environment.apiUrl}/api/products`).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/api/products`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-access-token');
    request.flush({});
  });

  it('should not add a token to the login request', () => {
    http.post(AUTH_LOGIN_ENDPOINT, {}).subscribe();

    const request = httpTesting.expectOne(AUTH_LOGIN_ENDPOINT);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('should not add an empty token', () => {
    accessToken.set(null);
    http.get(`${environment.apiUrl}/api/products`).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/api/products`);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('should not expose the token to an external URL', () => {
    http.get('https://example.com/resource').subscribe();

    const request = httpTesting.expectOne('https://example.com/resource');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
});
