import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppSidebar } from './sidebar';

@Component({
  standalone: true,
  template: '',
})
class TestDashboard {}

describe('AppSidebar', () => {
  let fixture: ComponentFixture<AppSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSidebar],
      providers: [provideRouter([{ path: 'dashboard', component: TestDashboard }])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSidebar);
    fixture.detectChanges();
  });

  it('should expose only the dashboard as an active navigation link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const dashboardLink = compiled.querySelector<HTMLAnchorElement>(
      '[data-testid="dashboard-navigation-link"]',
    );
    const disabledItems = compiled.querySelectorAll('[aria-disabled="true"]');

    expect(dashboardLink?.getAttribute('href')).toBe('/dashboard');
    expect(disabledItems).toHaveLength(5);
  });

  it('should notify the shell after selecting a navigation link', () => {
    const navigationSelected = vi.fn();
    fixture.componentInstance.navigationSelected.subscribe(navigationSelected);

    const dashboardLink = fixture.nativeElement.querySelector(
      '[data-testid="dashboard-navigation-link"]',
    ) as HTMLAnchorElement;
    dashboardLink.click();

    expect(navigationSelected).toHaveBeenCalledOnce();
  });
});
