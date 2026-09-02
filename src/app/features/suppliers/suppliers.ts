import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { SuppliersApiService } from '../../core/services/suppliers-api.service';
import { SupplierRequest, SupplierResponse } from '../../shared/models/supplier.models';
import { getApiErrorMessage } from '../../shared/utils/api-error-message';
import { notBlankValidator } from '../../shared/utils/form-validators';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './suppliers.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Suppliers {
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  protected readonly suppliers = signal<readonly SupplierResponse[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly supplierForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, notBlankValidator, Validators.maxLength(100)]],
    contactName: ['', [Validators.required, notBlankValidator, Validators.maxLength(150)]],
    email: [
      '',
      [Validators.required, notBlankValidator, Validators.email, Validators.maxLength(150)],
    ],
    phone: ['', [Validators.maxLength(30)]],
    address: ['', [Validators.maxLength(255)]],
  });

  constructor() {
    this.loadSuppliers();
  }

  protected loadSuppliers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.suppliersApi
      .getAll()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (suppliers) => this.suppliers.set(suppliers),
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, 'Impossible de charger les fournisseurs pour le moment.'),
          ),
      });
  }

  protected openCreateForm(): void {
    this.editingId.set(null);
    this.supplierForm.reset(this.emptyFormValue());
    this.openForm();
  }

  protected openEditForm(supplier: SupplierResponse): void {
    this.editingId.set(supplier.id);
    this.supplierForm.reset({
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone ?? '',
      address: supplier.address ?? '',
    });
    this.openForm();
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
    this.supplierForm.reset(this.emptyFormValue());
  }

  protected submit(): void {
    if (this.supplierForm.invalid || this.isSubmitting()) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    const value = this.supplierForm.getRawValue();
    const request: SupplierRequest = {
      name: value.name.trim(),
      contactName: value.contactName.trim(),
      email: value.email.trim().toLocaleLowerCase('fr-FR'),
      phone: this.optionalValue(value.phone),
      address: this.optionalValue(value.address),
    };
    const supplierId = this.editingId();
    const operation = supplierId
      ? this.suppliersApi.update(supplierId, request)
      : this.suppliersApi.create(request);

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
            supplierId ? 'Le fournisseur a été modifié.' : 'Le fournisseur a été créé.',
          );
          this.closeForm();
          this.loadSuppliers();
        },
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, "Impossible d'enregistrer ce fournisseur."),
          ),
      });
  }

  protected deleteSupplier(supplier: SupplierResponse): void {
    const confirmed =
      this.document.defaultView?.confirm(
        `Supprimer le fournisseur « ${supplier.name} » ? Cette action est irréversible.`,
      ) ?? false;

    if (!confirmed) {
      return;
    }

    this.deletingId.set(supplier.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.suppliersApi
      .delete(supplier.id)
      .pipe(
        finalize(() => this.deletingId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Le fournisseur a été supprimé.');
          this.loadSuppliers();
        },
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(
              error,
              'Impossible de supprimer ce fournisseur. Vérifiez qu’aucun produit ne l’utilise.',
            ),
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
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
  } {
    return { name: '', contactName: '', email: '', phone: '', address: '' };
  }
}
