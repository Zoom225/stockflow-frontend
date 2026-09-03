import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthenticatedUser } from './core/auth/auth.models';
import { AuthService } from './core/auth/auth.service';
import { DashboardApiService } from './core/services/dashboard-api.service';
import { ProductsApiService } from './core/services/products-api.service';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  const currentUser = signal<AuthenticatedUser | null>({
    userId: 42,
    fullName: 'Camille Martin',
    email: 'camille@stockflow.fr',
    role: 'ROLE_ADMIN',
  });
  const isAuthenticated = signal(true);

  beforeEach(async () => {
    isAuthenticated.set(true);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        {
          provide: AuthService,
          useValue: {
            currentUser: currentUser.asReadonly(),
            isAuthenticated: isAuthenticated.asReadonly(),
            logout: vi.fn(),
          },
        },
        {
          provide: DashboardApiService,
          useValue: {
            getSummary: () =>
              of({
                totalProducts: 0,
                totalCategories: 0,
                totalSuppliers: 0,
                lowStockProducts: 0,
                totalStockQuantity: 0,
                recentStockMovements: [],
              }),
          },
        },
        { provide: ProductsApiService, useValue: { getLowStock: () => of([]) } },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the public home at the root URL without authentication', async () => {
    isAuthenticated.set(false);
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    await router.navigateByUrl('/');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(router.url).toBe('/');
    expect(compiled.querySelector('app-home')).toBeTruthy();
    expect(compiled.querySelector('app-login')).toBeFalsy();
    expect(compiled.querySelector('h1')?.textContent).toContain('Votre stock devient clair');
  });

  it('should render the application shell on the dashboard route', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    await router.navigateByUrl('/dashboard');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-shell')).toBeTruthy();
    expect(compiled.querySelector('app-sidebar')).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent).toContain('Tableau de bord');
  });
});
