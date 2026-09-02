import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardApiService } from '../../core/services/dashboard-api.service';
import { ProductsApiService } from '../../core/services/products-api.service';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {
          provide: DashboardApiService,
          useValue: {
            getSummary: () =>
              of({
                totalProducts: 12,
                totalCategories: 4,
                totalSuppliers: 3,
                lowStockProducts: 2,
                totalStockQuantity: 87,
                recentStockMovements: [
                  {
                    id: 1,
                    productId: 5,
                    productName: 'Clavier mécanique',
                    productSku: 'KEY-001',
                    type: 'IN',
                    quantity: 10,
                    movementDate: '2026-09-02T10:00:00Z',
                  },
                ],
              }),
          },
        },
        {
          provide: ProductsApiService,
          useValue: { getLowStock: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
  });

  it('should render the summary returned by the dashboard API', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Tableau de bord');
    expect(compiled.textContent).toContain('12');
    expect(compiled.textContent).toContain('87');
    expect(compiled.textContent).toContain('Clavier mécanique');
  });
});
