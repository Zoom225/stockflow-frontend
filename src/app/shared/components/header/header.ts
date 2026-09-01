import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly navigationOpen = input(false);
  readonly menuRequested = output<void>();

  protected readonly currentUser = this.authService.currentUser;
  protected readonly userInitials = computed(() => {
    const user = this.currentUser();
    const displayName = user?.fullName.trim() || user?.email || '';
    const words = displayName.split(/\s+/).filter(Boolean);

    return words
      .slice(0, 2)
      .map((word) => word.charAt(0).toLocaleUpperCase('fr-FR'))
      .join('');
  });
  protected readonly roleLabel = computed(() =>
    this.currentUser()?.role === 'ROLE_ADMIN' ? 'Administrateur' : 'Utilisateur',
  );

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
