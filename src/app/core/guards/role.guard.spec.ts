import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthenticatedUser, UserRole } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';
import { ROLE_ROUTE_DATA_KEY, roleGuard } from './role.guard';

describe('roleGuard', () => {
  const currentUser = signal<AuthenticatedUser | null>(null);
  let router: Router;

  beforeEach(() => {
    currentUser.set(null);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser: currentUser.asReadonly() } },
      ],
    });
    router = TestBed.inject(Router);
  });

  it('should allow a user with an accepted role', () => {
    currentUser.set(createUser('ROLE_ADMIN'));

    expect(executeGuard(['ROLE_ADMIN'])).toBe(true);
  });

  it('should redirect a user without the required role', () => {
    currentUser.set(createUser('ROLE_USER'));

    const result = executeGuard(['ROLE_ADMIN']);

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });

  it('should redirect an anonymous user to login', () => {
    const result = executeGuard(['ROLE_ADMIN']);

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fdashboard');
  });

  function executeGuard(roles: readonly UserRole[]): boolean | UrlTree {
    const route = {
      data: { [ROLE_ROUTE_DATA_KEY]: roles },
    } as unknown as ActivatedRouteSnapshot;

    return TestBed.runInInjectionContext(
      () => roleGuard(route, { url: '/dashboard' } as RouterStateSnapshot) as boolean | UrlTree,
    );
  }

  function createUser(role: UserRole): AuthenticatedUser {
    return {
      userId: 42,
      fullName: 'Camille Martin',
      email: 'camille@stockflow.fr',
      role,
    };
  }
});
