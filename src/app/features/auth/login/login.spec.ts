import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { AuthenticatedUser, LoginRequest } from '../../../core/auth/auth.models';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/services/api-error';
import { Login } from './login';

const authenticatedUser: AuthenticatedUser = {
  userId: 42,
  fullName: 'Camille Martin',
  email: 'camille@stockflow.fr',
  role: 'ROLE_ADMIN',
};

class AuthServiceStub {
  readonly login = vi.fn((_request: LoginRequest): Observable<AuthenticatedUser> =>
    of(authenticatedUser),
  );
}

class RouterStub {
  readonly navigateByUrl = vi.fn((_url: string): Promise<boolean> => Promise.resolve(true));
}

describe('Login', () => {
  let authService: AuthServiceStub;
  let fixture: ComponentFixture<Login>;
  let router: RouterStub;

  beforeEach(async () => {
    authService = new AuthServiceStub();
    router = new RouterStub();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({ returnUrl: '/products' }) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
  });

  it('should show required errors without calling the API', () => {
    submitForm();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('L’adresse e-mail est obligatoire.');
    expect(compiled.textContent).toContain('Le mot de passe est obligatoire.');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should submit the credentials and honor a safe return URL', () => {
    fillInput('#email', 'camille@stockflow.fr');
    fillInput('#password', 'mot-de-passe');

    submitForm();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'camille@stockflow.fr',
      password: 'mot-de-passe',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/products');
  });

  it('should display a safe API error', () => {
    authService.login.mockReturnValue(
      throwError(() => new ApiError(401, 'Adresse e-mail ou mot de passe incorrect.')),
    );
    fillInput('#email', 'camille@stockflow.fr');
    fillInput('#password', 'incorrect');

    submitForm();

    const alert = fixture.nativeElement.querySelector('[data-testid="login-error"]') as HTMLElement;
    expect(alert.textContent).toContain('Adresse e-mail ou mot de passe incorrect.');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should toggle the password visibility', () => {
    const input = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    const toggle = fixture.nativeElement.querySelector(
      '[aria-label="Afficher le mot de passe"]',
    ) as HTMLButtonElement;

    toggle.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
  });

  function fillInput(selector: string, value: string): void {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function submitForm(): void {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }
});
