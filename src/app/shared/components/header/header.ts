import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {
  readonly navigationOpen = input(false);
  readonly menuRequested = output<void>();
}
