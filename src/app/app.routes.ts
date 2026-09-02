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
      {
        path: 'products',
        title: 'Produits | StockFlow',
        loadComponent: () =>
          import('./features/products/products').then(({ Products }) => Products),
      },
      {
        path: 'categories',
        title: 'Catégories | StockFlow',
        loadComponent: () =>
          import('./features/categories/categories').then(({ Categories }) => Categories),
      },
      {
        path: 'suppliers',
        title: 'Fournisseurs | StockFlow',
        loadComponent: () =>
          import('./features/suppliers/suppliers').then(({ Suppliers }) => Suppliers),
      },
      {
        path: 'stock-movements',
        title: 'Mouvements de stock | StockFlow',
        loadComponent: () =>
          import('./features/stock-movements/stock-movements').then(
            ({ StockMovements }) => StockMovements,
          ),
      },
      {
        path: 'alerts',
        title: 'Alertes de stock | StockFlow',
        loadComponent: () => import('./features/alerts/alerts').then(({ Alerts }) => Alerts),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
