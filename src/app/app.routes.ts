import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Connexion | StockFlow',
    loadComponent: () => import('./features/auth/login/login').then(({ Login }) => Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./shared/components/app-shell/app-shell').then(({ AppShell }) => AppShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        title: 'Tableau de bord | StockFlow',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(({ Dashboard }) => Dashboard),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
