import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
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
