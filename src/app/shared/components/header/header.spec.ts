import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthenticatedUser } from '../../../core/auth/auth.models';
import { AuthService } from '../../../core/auth/auth.service';
import { AppHeader } from './header';

describe('AppHeader', () => {
  let fixture: ComponentFixture<AppHeader>;
  const currentUser = signal<AuthenticatedUser | null>({
    userId: 42,
    fullName: 'Camille Martin',
    email: 'camille@stockflow.fr',
    role: 'ROLE_ADMIN',
  });
  const authService = { currentUser: currentUser.asReadonly(), logout: vi.fn() };

  beforeEach(async () => {
    authService.logout.mockReset();
    await TestBed.configureTestingModule({
      imports: [AppHeader],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeader);
  });

  it('should expose the mobile navigation state', () => {
    fixture.componentRef.setInput('navigationOpen', true);
    fixture.detectChanges();

    const menuButton = fixture.nativeElement.querySelector(
      '[data-testid="menu-button"]',
    ) as HTMLButtonElement;

    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
  });

  it('should request the navigation opening when the menu button is clicked', () => {
    const menuRequested = vi.fn();
    fixture.componentInstance.menuRequested.subscribe(menuRequested);
    fixture.detectChanges();

    const menuButton = fixture.nativeElement.querySelector(
      '[data-testid="menu-button"]',
    ) as HTMLButtonElement;
    menuButton.click();

    expect(menuRequested).toHaveBeenCalledOnce();
  });

  it('should render the authenticated user without exposing the backend role name', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Camille Martin');
    expect(compiled.textContent).toContain('Administrateur');
    expect(compiled.textContent).not.toContain('ROLE_ADMIN');
  });

  it('should clear the session and return to login on logout', () => {
    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl');
    fixture.detectChanges();

    const logoutButton = fixture.nativeElement.querySelector(
      '[data-testid="logout-button"]',
    ) as HTMLButtonElement;
    logoutButton.click();

    expect(authService.logout).toHaveBeenCalledOnce();
    expect(navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
