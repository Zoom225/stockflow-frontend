import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CategoriesApiService } from '../../core/services/categories-api.service';
import { ProductsApiService } from '../../core/services/products-api.service';
import { SuppliersApiService } from '../../core/services/suppliers-api.service';
import { Products } from './products';

describe('Products', () => {
  const productsApi = {
    getAll: vi.fn(() => of([])),
    create: vi.fn(() =>
      of({
        id: 1,
        sku: 'LAP-001',
        name: 'Ordinateur portable',
        description: null,
        purchasePrice: 700,
        sellingPrice: 900,
        quantityInStock: 0,
        minimumStock: 2,
        lowStock: true,
        categoryId: 3,
        categoryName: 'Informatique',
        supplierId: null,
        supplierName: null,
        createdAt: '2026-09-02T10:00:00Z',
        updatedAt: '2026-09-02T10:00:00Z',
      }),
    ),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const categoriesApi = {
    getAll: vi.fn(() =>
      of([
        {
          id: 3,
          name: 'Informatique',
          description: null,
          createdAt: '2026-09-02T10:00:00Z',
          updatedAt: '2026-09-02T10:00:00Z',
        },
      ]),
    ),
  };
  const suppliersApi = { getAll: vi.fn(() => of([])) };
  let fixture: ComponentFixture<Products>;

  beforeEach(async () => {
    productsApi.getAll.mockClear();
    productsApi.create.mockClear();

    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [
        provideRouter([]),
        { provide: ProductsApiService, useValue: productsApi },
        { provide: CategoriesApiService, useValue: categoriesApi },
        { provide: SuppliersApiService, useValue: suppliersApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    fixture.detectChanges();
  });

  it('should create a product without sending an initial stock quantity', () => {
    clickButton('Ajouter un produit');
    setInput('#product-sku', ' LAP-001 ');
    setInput('#product-name', ' Ordinateur portable ');
    setInput('#product-purchase-price', '700');
    setInput('#product-selling-price', '900');
    selectOption('#product-category', 1);
    setInput('#product-minimum-stock', '2');
    submitForm();

    expect(productsApi.create).toHaveBeenCalledWith({
      sku: 'LAP-001',
      name: 'Ordinateur portable',
      description: null,
      purchasePrice: 700,
      sellingPrice: 900,
      categoryId: 3,
      minimumStock: 2,
      supplierId: null,
    });
  });

  function clickButton(label: string): void {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = Array.from(compiled.querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.textContent?.includes(label),
    );
    button?.click();
    fixture.detectChanges();
  }

  function setInput(selector: string, value: string): void {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function selectOption(selector: string, index: number): void {
    const select = fixture.nativeElement.querySelector(selector) as HTMLSelectElement;
    select.selectedIndex = index;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  function submitForm(): void {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }
});
