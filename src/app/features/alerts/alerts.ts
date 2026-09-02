import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ProductsApiService } from '../../core/services/products-api.service';
import { StockDataRefreshService } from '../../core/services/stock-data-refresh.service';
import { ProductResponse } from '../../shared/models/product.models';
import { getApiErrorMessage } from '../../shared/utils/api-error-message';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './alerts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Alerts {
  private readonly productsApi = inject(ProductsApiService);
  private readonly refreshService = inject(StockDataRefreshService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly products = signal<readonly ProductResponse[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.refreshService.revision();
      this.loadAlerts();
    });
  }

  protected loadAlerts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productsApi
      .getLowStock()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (products) => this.products.set(products),
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, 'Impossible de charger les alertes de stock.'),
          ),
      });
  }

  protected alertLevel(product: ProductResponse): string {
    return product.quantityInStock === 0 ? 'Rupture de stock' : 'Sous le seuil minimum';
  }
}
