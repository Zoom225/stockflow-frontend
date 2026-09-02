import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StockDataRefreshService {
  private readonly revisionState = signal(0);

  readonly revision = this.revisionState.asReadonly();

  notifyStockChanged(): void {
    this.revisionState.update((revision) => revision + 1);
  }
}
