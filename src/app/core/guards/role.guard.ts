import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';

export const ROLE_ROUTE_DATA_KEY = 'roles';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (!user) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const requiredRoles = route.data[ROLE_ROUTE_DATA_KEY] as readonly UserRole[] | undefined;

  return !requiredRoles?.length || requiredRoles.includes(user.role)
    ? true
    : router.createUrlTree(['/dashboard']);
};
