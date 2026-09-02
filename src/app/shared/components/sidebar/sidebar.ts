import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavigationItem {
  readonly label: string;
  readonly route: string;
  readonly testId: string;
  readonly iconPath: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidebar {
  readonly isOpen = input(false);
  readonly navigationSelected = output<void>();

  protected readonly navigationItems: readonly NavigationItem[] = [
    {
      label: 'Tableau de bord',
      route: '/dashboard',
      testId: 'dashboard-navigation-link',
      iconPath: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M9 20v-6h6v6',
    },
    {
      label: 'Produits',
      route: '/products',
      testId: 'products-navigation-link',
      iconPath: 'm12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v9m8-4.5-8 4.5m-8-4.5 8 4.5',
    },
    {
      label: 'Catégories',
      route: '/categories',
      testId: 'categories-navigation-link',
      iconPath: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
    },
    {
      label: 'Fournisseurs',
      route: '/suppliers',
      testId: 'suppliers-navigation-link',
      iconPath:
        'M14 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-1A4.5 4.5 0 0 0 4 18.5V20m5-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a2.5 2.5 0 1 0 0-5m1 8.5a4 4 0 0 1 3 3.87V20',
    },
    {
      label: 'Mouvements de stock',
      route: '/stock-movements',
      testId: 'stock-movements-navigation-link',
      iconPath: 'M7 7h11m0 0-3-3m3 3-3 3m2 7H6m0 0 3 3m-3-3 3-3',
    },
    {
      label: 'Alertes',
      route: '/alerts',
      testId: 'alerts-navigation-link',
      iconPath: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4',
    },
  ];
}
