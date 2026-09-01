import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the StockFlow initialization page', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand__name')?.textContent).toContain('StockFlow');
    expect(compiled.querySelector('h1')?.textContent).toContain('Le socle frontend est prêt.');
    expect(compiled.querySelector('[data-testid="app-status"]')?.textContent).toContain(
      'Initialisation terminée',
    );
  });
});
