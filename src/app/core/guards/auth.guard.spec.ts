import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const isAuthenticated = signal(false);
  let router: Router;

  beforeEach(() => {
    isAuthenticated.set(false);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: isAuthenticated.asReadonly() } },
      ],
    });
    router = TestBed.inject(Router);
  });

  it('should allow an authenticated user', () => {
    isAuthenticated.set(true);

    expect(executeGuard('/dashboard')).toBe(true);
  });

  it('should redirect an anonymous user to login with the requested URL', () => {
    const result = executeGuard('/dashboard');

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fdashboard');
  });

  function executeGuard(url: string): boolean | UrlTree {
    return TestBed.runInInjectionContext(
      () =>
        authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot) as
          boolean | UrlTree,
    );
  }
});
