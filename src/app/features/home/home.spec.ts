import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

@Component({
  standalone: true,
  template: '',
})
class TestLogin {}

describe('Home', () => {
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([{ path: 'login', component: TestLogin }])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
  });

  it('should present StockFlow and expose the demo login link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const demoLink = compiled.querySelector<HTMLAnchorElement>('[data-testid="home-demo-link"]');

    expect(compiled.querySelector('h1')?.textContent).toContain('Votre stock devient clair');
    expect(demoLink?.getAttribute('href')).toBe('/login');
    expect(compiled.textContent).toContain('Compte démo public et prérempli');
  });

  it('should display the six implemented business capabilities', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('[data-testid="home-feature-card"]')).toHaveLength(6);
    expect(compiled.textContent).toContain('Catalogue produits');
    expect(compiled.textContent).toContain('Alertes de stock faible');
    expect(compiled.textContent).toContain('Dashboard opérationnel');
  });
});
