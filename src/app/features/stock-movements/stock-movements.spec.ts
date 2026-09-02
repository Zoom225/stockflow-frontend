import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProductsApiService } from '../../core/services/products-api.service';
import { StockMovementsApiService } from '../../core/services/stock-movements-api.service';
import { StockMovements } from './stock-movements';

describe('StockMovements', () => {
  const movementResponse = {
    id: 11,
    productId: 4,
    productName: 'Clavier',
    productSku: 'KEY-001',
    type: 'IN' as const,
    quantity: 5,
    reason: 'Livraison',
    movementDate: '2026-09-02T10:00:00Z',
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
  };
  const movementsApi = {
    getAll: vi.fn(() => of([])),
    restock: vi.fn(() => of(movementResponse)),
    outbound: vi.fn(() => of({ ...movementResponse, type: 'OUT' as const })),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const productsApi = {
    getAll: vi.fn(() =>
      of([
        {
          id: 4,
          sku: 'KEY-001',
          name: 'Clavier',
          description: null,
          purchasePrice: 40,
          sellingPrice: 70,
          quantityInStock: 5,
          minimumStock: 2,
          lowStock: false,
          categoryId: 1,
          categoryName: 'Informatique',
          supplierId: null,
          supplierName: null,
          createdAt: '2026-09-02T10:00:00Z',
          updatedAt: '2026-09-02T10:00:00Z',
        },
      ]),
    ),
  };
  let fixture: ComponentFixture<StockMovements>;

  beforeEach(async () => {
    movementsApi.restock.mockClear();

    await TestBed.configureTestingModule({
      imports: [StockMovements],
      providers: [
        provideRouter([]),
        { provide: StockMovementsApiService, useValue: movementsApi },
        { provide: ProductsApiService, useValue: productsApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockMovements);
    fixture.detectChanges();
  });

  it('should reject a zero quantity before calling the API', () => {
    openRestockForm();
    selectProduct();
    setQuantity('0');
    submitForm();

    expect(movementsApi.restock).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('La quantité doit être supérieure à 0.');
  });

  it('should call the dedicated restock endpoint with a positive quantity', () => {
    openRestockForm();
    selectProduct();
    setQuantity('5');
    submitForm();

    expect(movementsApi.restock).toHaveBeenCalledWith(4, {
      quantity: 5,
      reason: null,
      movementDate: null,
    });
  });

  function openRestockForm(): void {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = Array.from(compiled.querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.textContent?.includes('Entrée de stock'),
    );
    button?.click();
    fixture.detectChanges();
  }

  function selectProduct(): void {
    const select = fixture.nativeElement.querySelector('#movement-product') as HTMLSelectElement;
    select.selectedIndex = 1;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  function setQuantity(value: string): void {
    const input = fixture.nativeElement.querySelector('#movement-quantity') as HTMLInputElement;
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
