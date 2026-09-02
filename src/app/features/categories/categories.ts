import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CategoriesApiService } from '../../core/services/categories-api.service';
import { CategoryRequest, CategoryResponse } from '../../shared/models/category.models';
import { getApiErrorMessage } from '../../shared/utils/api-error-message';
import { notBlankValidator } from '../../shared/utils/form-validators';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories {
  private readonly categoriesApi = inject(CategoriesApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  protected readonly categories = signal<readonly CategoryResponse[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly categoryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, notBlankValidator, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(255)]],
  });

  constructor() {
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.categoriesApi
      .getAll()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (categories) => this.categories.set(categories),
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, 'Impossible de charger les catégories pour le moment.'),
          ),
      });
  }

  protected openCreateForm(): void {
    this.editingId.set(null);
    this.categoryForm.reset({ name: '', description: '' });
    this.openForm();
  }

  protected openEditForm(category: CategoryResponse): void {
    this.editingId.set(category.id);
    this.categoryForm.reset({
      name: category.name,
      description: category.description ?? '',
    });
    this.openForm();
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
    this.categoryForm.reset({ name: '', description: '' });
  }

  protected submit(): void {
    if (this.categoryForm.invalid || this.isSubmitting()) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const rawValue = this.categoryForm.getRawValue();
    const request: CategoryRequest = {
      name: rawValue.name.trim(),
      description: this.optionalValue(rawValue.description),
    };
    const categoryId = this.editingId();
    const operation = categoryId
      ? this.categoriesApi.update(categoryId, request)
      : this.categoriesApi.create(request);

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
            categoryId ? 'La catégorie a été modifiée.' : 'La catégorie a été créée.',
          );
          this.closeForm();
          this.loadCategories();
        },
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(error, "Impossible d'enregistrer cette catégorie."),
          ),
      });
  }

  protected deleteCategory(category: CategoryResponse): void {
    const confirmed =
      this.document.defaultView?.confirm(
        `Supprimer la catégorie « ${category.name} » ? Cette action est irréversible.`,
      ) ?? false;

    if (!confirmed) {
      return;
    }

    this.deletingId.set(category.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.categoriesApi
      .delete(category.id)
      .pipe(
        finalize(() => this.deletingId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.successMessage.set('La catégorie a été supprimée.');
          this.loadCategories();
        },
        error: (error: unknown) =>
          this.errorMessage.set(
            getApiErrorMessage(
              error,
              'Impossible de supprimer cette catégorie. Vérifiez qu’aucun produit ne l’utilise.',
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
}
