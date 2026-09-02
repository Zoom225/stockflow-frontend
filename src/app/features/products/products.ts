import { CurrencyPipe, DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { CategoriesApiService } from '../../core/services/categories-api.service';
import { ProductsApiService } from '../../core/services/products-api.service';
import { SuppliersApiService } from '../../core/services/suppliers-api.service';
import { CategoryResponse } from '../../shared/models/category.models';
import { ProductRequest, ProductResponse } from '../../shared/models/product.models';
import { SupplierResponse } from '../../shared/models/supplier.models';
import { getApiErrorMessage } from '../../shared/utils/api-error-message';
import { notBlankValidator } from '../../shared/utils/form-validators';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './products.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private readonly productsApi = inject(ProductsApiService);
  private readonly categoriesApi = inject(CategoriesApiService);
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  protected readonly products = signal<readonly ProductResponse[]>([]);
  protected readonly categories = signal<readonly CategoryResponse[]>([]);
  protected readonly suppliers = signal<readonly SupplierResponse[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly filteredProducts = computed(() => {
    const normalizedSearch = this.searchTerm().trim().toLocaleLowerCase('fr-FR');
    if (!normalizedSearch) {
      return this.products();
    }

    return this.products().filter((product) =>
      [product.name, product.sku, product.categoryName, product.supplierName ?? ''].some((value) =>
        value.toLocaleLowerCase('fr-FR').includes(normalizedSearch),
      ),
    );
  });

  protected readonly productForm = this.formBuilder.group({
    sku: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    name: this.formBuilder.nonNullable.control('', [
      Validators.required,
      notBlankValidator,
      Validators.maxLength(150),
    ]),
    description: this.formBuilder.nonNullable.control('', [Validators.maxLength(255)]),
    purchasePrice: this.formBuilder.control<number | null>(null, [
      Validators.required,
      notBlankValidator,
      Validators.min(0),
    ]),
    sellingPrice: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
    ]),
    categoryId: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    minimumStock: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
    ]),
    supplierId: this.formBuilder.control<number | null>(null),
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.searchTerm.set(params.get('search') ?? '');
    });
    this.loadPage();
  }

  protected loadPage(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      products: this.productsApi.getAll(),
      categories: this.categoriesApi.getAll(),
      suppliers: this.suppliersApi.getAll(),
    })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ products, categories, suppliers }) => {
          this.products.set(products);
          this.categories.set(categories);
          this.suppliers.set(suppliers);
        },
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, 'Impossible de charger le catalogue pour le moment.'),
          ),
      });
  }

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected openCreateForm(): void {
    this.editingId.set(null);
    this.productForm.reset(this.emptyFormValue());
    this.openForm();
  }

  protected openEditForm(product: ProductResponse): void {
    this.editingId.set(product.id);
    this.productForm.reset({
      sku: product.sku,
      name: product.name,
      description: product.description ?? '',
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      categoryId: product.categoryId,
      minimumStock: product.minimumStock,
      supplierId: product.supplierId,
    });
    this.openForm();
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
    this.productForm.reset(this.emptyFormValue());
  }

  protected submit(): void {
    if (this.productForm.invalid || this.isSubmitting()) {
      this.productForm.markAllAsTouched();
      return;
    }

    const value = this.productForm.getRawValue();
    if (
      value.purchasePrice === null ||
      value.sellingPrice === null ||
      value.categoryId === null ||
      value.minimumStock === null
    ) {
      return;
    }

    const request: ProductRequest = {
      sku: value.sku.trim(),
      name: value.name.trim(),
      description: this.optionalValue(value.description),
      purchasePrice: Number(value.purchasePrice),
      sellingPrice: Number(value.sellingPrice),
      categoryId: Number(value.categoryId),
      minimumStock: Number(value.minimumStock),
      supplierId: value.supplierId ? Number(value.supplierId) : null,
    };
    const productId = this.editingId();
    const operation = productId
      ? this.productsApi.update(productId, request)
      : this.productsApi.create(request);

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    operation
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.successMessage.set(
            productId ? 'Le produit a été modifié.' : 'Le produit a été créé.',
          );
          this.closeForm();
          this.loadProducts();
        },
        error: (error: unknown) =>
          this.errorMessage.set(getApiErrorMessage(error, "Impossible d'enregistrer ce produit.")),
      });
  }

  protected deleteProduct(product: ProductResponse): void {
    const confirmed =
      this.document.defaultView?.confirm(
        `Supprimer le produit « ${product.name} » ? Cette action est irréversible.`,
      ) ?? false;

    if (!confirmed) {
      return;
    }

    this.deletingId.set(product.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.productsApi
      .delete(product.id)
      .pipe(
        finalize(() => this.deletingId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Le produit a été supprimé.');
          this.loadProducts();
        },
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(
              error,
              'Impossible de supprimer ce produit. Son historique de stock doit être conservé.',
            ),
          ),
      });
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    this.productsApi
      .getAll()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (products) => this.products.set(products),
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, 'Impossible d’actualiser la liste des produits.'),
          ),
      });
  }

  private openForm(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.formOpen.set(true);
  }

  private optionalValue(value: string): string | null {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  private emptyFormValue(): {
    sku: string;
    name: string;
    description: string;
    purchasePrice: null;
    sellingPrice: null;
    categoryId: null;
    minimumStock: null;
    supplierId: null;
  } {
    return {
      sku: '',
      name: '',
      description: '',
      purchasePrice: null,
      sellingPrice: null,
      categoryId: null,
      minimumStock: null,
      supplierId: null,
    };
  }
}
