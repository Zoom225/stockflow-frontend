import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppHeader } from './header';

describe('AppHeader', () => {
  let fixture: ComponentFixture<AppHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHeader],
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
});
