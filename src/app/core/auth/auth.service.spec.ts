import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AUTH_LOGIN_ENDPOINT } from './auth.constants';
import { AuthResponse, AuthSession, LoginRequest } from './auth.models';
import { AuthService } from './auth.service';
import { AuthSessionStorage } from './auth-session-storage.service';

class AuthSessionStorageStub {
  readonly read = vi.fn((): AuthSession | null => null);
  readonly save = vi.fn((_session: AuthSession): void => undefined);
  readonly clear = vi.fn((): void => undefined);
}

const loginRequest: LoginRequest = {
  email: 'camille@stockflow.fr',
  password: 'mot-de-passe',
};

const authResponse: AuthResponse = {
  accessToken: 'jwt-access-token',
  tokenType: 'Bearer',
  userId: 42,
  fullName: 'Camille Martin',
  email: 'camille@stockflow.fr',
  role: 'ROLE_ADMIN',
};

describe('AuthService', () => {
  let httpTesting: HttpTestingController;
  let storage: AuthSessionStorageStub;

  beforeEach(() => {
    storage = new AuthSessionStorageStub();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthSessionStorage, useValue: storage },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should restore an existing session when created', () => {
    const persistedSession: AuthSession = {
      accessToken: 'persisted-token',
      user: {
        userId: 7,
        fullName: 'Alex Dupont',
        email: 'alex@stockflow.fr',
        role: 'ROLE_USER',
      },
    };
    storage.read.mockReturnValue(persistedSession);

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual(persistedSession.user);
    expect(service.accessToken()).toBe('persisted-token');
  });

  it('should authenticate with the OpenAPI contract and persist the session', () => {
    const service = TestBed.inject(AuthService);
    let authenticatedEmail: string | undefined;

    service.login(loginRequest).subscribe((user) => (authenticatedEmail = user.email));

    const request = httpTesting.expectOne(AUTH_LOGIN_ENDPOINT);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(loginRequest);
    request.flush(authResponse);

    expect(authenticatedEmail).toBe('camille@stockflow.fr');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.accessToken()).toBe('jwt-access-token');
    expect(storage.save).toHaveBeenCalledOnce();
    expect(storage.save).toHaveBeenCalledWith({
      accessToken: 'jwt-access-token',
      user: {
        userId: 42,
        fullName: 'Camille Martin',
        email: 'camille@stockflow.fr',
        role: 'ROLE_ADMIN',
      },
    });
  });

  it('should reject an incomplete authentication response', () => {
    const service = TestBed.inject(AuthService);
    let receivedError: unknown;

    service.login(loginRequest).subscribe({ error: (error: unknown) => (receivedError = error) });
    httpTesting.expectOne(AUTH_LOGIN_ENDPOINT).flush({ email: loginRequest.email });

    expect(receivedError).toBeInstanceOf(Error);
    expect(service.isAuthenticated()).toBe(false);
    expect(storage.save).not.toHaveBeenCalled();
  });

  it('should clear the complete session on logout', () => {
    storage.read.mockReturnValue({
      accessToken: 'persisted-token',
      user: {
        userId: 7,
        fullName: 'Alex Dupont',
        email: 'alex@stockflow.fr',
        role: 'ROLE_USER',
      },
    });
    const service = TestBed.inject(AuthService);

    service.logout();

    expect(storage.clear).toHaveBeenCalledOnce();
    expect(service.currentUser()).toBeNull();
    expect(service.accessToken()).toBeNull();
  });
});
