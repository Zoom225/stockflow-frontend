import { DatePipe, DOCUMENT } from '@angular/common';
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
import { ProductsApiService } from '../../core/services/products-api.service';
import { StockDataRefreshService } from '../../core/services/stock-data-refresh.service';
import { StockMovementsApiService } from '../../core/services/stock-movements-api.service';
import { ProductResponse } from '../../shared/models/product.models';
import {
  RestockProductRequest,
  StockMovementRequest,
  StockMovementResponse,
  StockMovementType,
} from '../../shared/models/stock-movement.models';
import { getApiErrorMessage } from '../../shared/utils/api-error-message';

type MovementAction = 'restock' | 'outbound' | 'edit';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './stock-movements.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockMovements {
  private readonly movementsApi = inject(StockMovementsApiService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly refreshService = inject(StockDataRefreshService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  protected readonly movements = signal<readonly StockMovementResponse[]>([]);
  protected readonly products = signal<readonly ProductResponse[]>([]);
  protected readonly productFilter = signal<number | null>(null);
  protected readonly action = signal<MovementAction | null>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly displayedMovements = computed(() => {
    const productId = this.productFilter();
    const filtered = productId
      ? this.movements().filter((movement) => movement.productId === productId)
      : this.movements();

    return [...filtered].sort(
      (left, right) =>
        new Date(right.movementDate).getTime() - new Date(left.movementDate).getTime(),
    );
  });

  protected readonly movementForm = this.formBuilder.group({
    productId: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    type: this.formBuilder.nonNullable.control<StockMovementType>('IN', [Validators.required]),
    quantity: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    reason: this.formBuilder.nonNullable.control('', [Validators.maxLength(255)]),
    movementDate: this.formBuilder.nonNullable.control(''),
  });

  constructor() {
    this.loadData();
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const action = params.get('action');
      const productId = Number(params.get('productId'));
      if (action === 'restock' && Number.isInteger(productId) && productId > 0) {
        this.openAction('restock', productId);
      }
    });
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      movements: this.movementsApi.getAll(),
      products: this.productsApi.getAll(),
    })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ movements, products }) => {
          this.movements.set(movements);
          this.products.set(products);
        },
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, 'Impossible de charger les mouvements de stock.'),
          ),
      });
  }

  protected updateProductFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.productFilter.set(value ? Number(value) : null);
  }

  protected openAction(
    action: Exclude<MovementAction, 'edit'>,
    productId: number | null = null,
  ): void {
    this.action.set(action);
    this.editingId.set(null);
    this.movementForm.reset({
      productId,
      type: action === 'restock' ? 'IN' : 'OUT',
      quantity: null,
      reason: '',
      movementDate: '',
    });
    this.clearFeedback();
  }

  protected openEditForm(movement: StockMovementResponse): void {
    this.action.set('edit');
    this.editingId.set(movement.id);
    this.movementForm.reset({
      productId: movement.productId,
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason ?? '',
      movementDate: this.toLocalDateTime(movement.movementDate),
    });
    this.clearFeedback();
  }

  protected closeForm(): void {
    this.action.set(null);
    this.editingId.set(null);
    this.movementForm.reset({
      productId: null,
      type: 'IN',
      quantity: null,
      reason: '',
      movementDate: '',
    });
  }

  protected submit(): void {
    const action = this.action();
    if (!action || this.movementForm.invalid || this.isSubmitting()) {
      this.movementForm.markAllAsTouched();
      return;
    }

    const value = this.movementForm.getRawValue();
    if (value.productId === null || value.quantity === null) {
      return;
    }

    const productId = Number(value.productId);
    const baseRequest: RestockProductRequest = {
      quantity: Number(value.quantity),
      reason: this.optionalValue(value.reason),
      movementDate: this.toApiDateTime(value.movementDate),
    };
    const movementId = this.editingId();
    const operation =
      action === 'restock'
        ? this.movementsApi.restock(productId, baseRequest)
        : action === 'outbound'
          ? this.movementsApi.outbound(productId, baseRequest)
          : this.movementsApi.update(movementId!, {
              productId,
              type: value.type,
              ...baseRequest,
            } satisfies StockMovementRequest);

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
            action === 'restock'
              ? 'L’entrée de stock a été enregistrée.'
              : action === 'outbound'
                ? 'La sortie de stock a été enregistrée.'
                : 'Le mouvement a été modifié et le stock recalculé.',
          );
          this.closeForm();
          this.refreshService.notifyStockChanged();
          this.loadData();
        },
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, "Impossible d'enregistrer ce mouvement de stock."),
          ),
      });
  }

  protected deleteMovement(movement: StockMovementResponse): void {
    const confirmed =
      this.document.defaultView?.confirm(
        `Supprimer ce mouvement de ${movement.quantity} unité(s) pour « ${movement.productName} » ? Le stock sera recalculé par le serveur.`,
      ) ?? false;

    if (!confirmed) {
      return;
    }

    this.deletingId.set(movement.id);
    this.clearFeedback();

    this.movementsApi
      .delete(movement.id)
      .pipe(
        finalize(() => this.deletingId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Le mouvement a été supprimé et le stock recalculé.');
          this.refreshService.notifyStockChanged();
          this.loadData();
        },
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, 'Impossible de supprimer ce mouvement de stock.'),
          ),
      });
  }

  protected selectedProduct(): ProductResponse | undefined {
    const productId = this.movementForm.controls.productId.value;
    return this.products().find((product) => product.id === Number(productId));
  }

  protected actionTitle(): string {
    switch (this.action()) {
      case 'restock':
        return 'Entrée de stock';
      case 'outbound':
        return 'Sortie de stock';
      case 'edit':
        return 'Modifier le mouvement';
      default:
        return '';
    }
  }

  private clearFeedback(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private optionalValue(value: string): string | null {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  private toApiDateTime(value: string): string | null {
    return value ? new Date(value).toISOString() : null;
  }

  private toLocalDateTime(value: string): string {
    const date = new Date(value);
    const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return localTime.toISOString().slice(0, 16);
  }
}
