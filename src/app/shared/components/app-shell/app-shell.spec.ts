import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthenticatedUser } from '../../../core/auth/auth.models';
import { AuthService } from '../../../core/auth/auth.service';
import { AppShell } from './app-shell';

@Component({
  standalone: true,
  template: '<p>Contenu de test</p>',
})
class TestPage {}

describe('AppShell', () => {
  let fixture: ComponentFixture<AppShell>;
  const currentUser = signal<AuthenticatedUser | null>({
    userId: 42,
    fullName: 'Camille Martin',
    email: 'camille@stockflow.fr',
    role: 'ROLE_ADMIN',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideRouter([{ path: '', component: TestPage }]),
        {
          provide: AuthService,
          useValue: { currentUser: currentUser.asReadonly(), logout: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
  });

  it('should render the sidebar, header and main content region', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-sidebar')).toBeTruthy();
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('#main-content')).toBeTruthy();
  });

  it('should open and close the mobile navigation', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const menuButton = compiled.querySelector<HTMLButtonElement>('[data-testid="menu-button"]');

    menuButton?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('[data-testid="sidebar-backdrop"]')).toBeTruthy();
    expect(menuButton?.getAttribute('aria-expanded')).toBe('true');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(compiled.querySelector('[data-testid="sidebar-backdrop"]')).toBeFalsy();
    expect(menuButton?.getAttribute('aria-expanded')).toBe('false');
  });
});
