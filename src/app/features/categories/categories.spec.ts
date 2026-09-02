import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CategoriesApiService } from '../../core/services/categories-api.service';
import { Categories } from './categories';

describe('Categories', () => {
  const categoriesApi = {
    getAll: vi.fn(() => of([])),
    create: vi.fn(() =>
      of({
        id: 1,
        name: 'Informatique',
        description: 'Matériel informatique',
        createdAt: '2026-09-02T10:00:00Z',
        updatedAt: '2026-09-02T10:00:00Z',
      }),
    ),
    update: vi.fn(),
    delete: vi.fn(),
  };
  let fixture: ComponentFixture<Categories>;

  beforeEach(async () => {
    categoriesApi.getAll.mockClear();
    categoriesApi.create.mockClear();

    await TestBed.configureTestingModule({
      imports: [Categories],
      providers: [{ provide: CategoriesApiService, useValue: categoriesApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(Categories);
    fixture.detectChanges();
  });

  it('should reject an empty or whitespace-only name', () => {
    clickButton('Ajouter une catégorie');
    setInput('#category-name', '   ');
    submitForm();

    expect(categoriesApi.create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Le nom est obligatoire.');
  });

  it('should trim and submit a valid category request', () => {
    clickButton('Ajouter une catégorie');
    setInput('#category-name', '  Informatique  ');
    setInput('#category-description', '  Matériel informatique  ');
    submitForm();

    expect(categoriesApi.create).toHaveBeenCalledWith({
      name: 'Informatique',
      description: 'Matériel informatique',
    });
    expect(fixture.nativeElement.textContent).toContain('La catégorie a été créée.');
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

  function submitForm(): void {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }
});
