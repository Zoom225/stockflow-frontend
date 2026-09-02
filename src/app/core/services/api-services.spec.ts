import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CategoriesApiService } from './categories-api.service';
import { DashboardApiService } from './dashboard-api.service';
import { ProductsApiService } from './products-api.service';
import { StockMovementsApiService } from './stock-movements-api.service';
import { SuppliersApiService } from './suppliers-api.service';

describe('StockFlow API services', () => {
  const apiUrl = `${environment.apiUrl}/api`;
  let httpTesting: HttpTestingController;
  let categoriesApi: CategoriesApiService;
  let suppliersApi: SuppliersApiService;
  let productsApi: ProductsApiService;
  let movementsApi: StockMovementsApiService;
  let dashboardApi: DashboardApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    categoriesApi = TestBed.inject(CategoriesApiService);
    suppliersApi = TestBed.inject(SuppliersApiService);
    productsApi = TestBed.inject(ProductsApiService);
    movementsApi = TestBed.inject(StockMovementsApiService);
    dashboardApi = TestBed.inject(DashboardApiService);
  });

  afterEach(() => httpTesting.verify());

  it('should use the categories collection endpoint for creation', () => {
    const body = { name: 'Informatique', description: null };
    categoriesApi.create(body).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/categories`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({});
  });

  it('should use the supplier resource endpoint for updates', () => {
    const body = {
      name: 'Tech Supply',
      contactName: 'Camille Martin',
      email: 'contact@tech.test',
      phone: null,
      address: null,
    };
    suppliersApi.update(7, body).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/suppliers/7`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(body);
    request.flush({});
  });

  it('should request low-stock products from the verified endpoint', () => {
    productsApi.getLowStock().subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/products/low-stock`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('should send product updates without a stock quantity field', () => {
    const body = {
      sku: 'KEY-001',
      name: 'Clavier',
      description: null,
      purchasePrice: 50,
      sellingPrice: 80,
      categoryId: 2,
      minimumStock: 3,
      supplierId: null,
    };
    productsApi.update(9, body).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/products/9`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(body);
    expect(request.request.body).not.toHaveProperty('quantityInStock');
    request.flush({});
  });

  it('should use the dedicated restock endpoint', () => {
    const body = { quantity: 10, reason: 'Livraison', movementDate: null };
    movementsApi.restock(4, body).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/stock-movements/products/4/restock`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({});
  });

  it('should use the dedicated outbound endpoint', () => {
    const body = { quantity: 2, reason: 'Commande', movementDate: null };
    movementsApi.outbound(4, body).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/stock-movements/products/4/outbound`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({});
  });

  it('should update and delete movements on their resource endpoint', () => {
    const body = {
      productId: 4,
      type: 'OUT' as const,
      quantity: 1,
      reason: null,
      movementDate: null,
    };
    movementsApi.update(15, body).subscribe();
    movementsApi.delete(16).subscribe();

    const updateRequest = httpTesting.expectOne(`${apiUrl}/stock-movements/15`);
    const deleteRequest = httpTesting.expectOne(`${apiUrl}/stock-movements/16`);
    expect(updateRequest.request.method).toBe('PUT');
    expect(updateRequest.request.body).toEqual(body);
    expect(deleteRequest.request.method).toBe('DELETE');
    updateRequest.flush({});
    deleteRequest.flush(null);
  });

  it('should load the dashboard summary from its verified endpoint', () => {
    dashboardApi.getSummary().subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/dashboard/summary`);
    expect(request.request.method).toBe('GET');
    request.flush({
      totalProducts: 0,
      totalCategories: 0,
      totalSuppliers: 0,
      lowStockProducts: 0,
      totalStockQuantity: 0,
      recentStockMovements: [],
    });
  });
});
