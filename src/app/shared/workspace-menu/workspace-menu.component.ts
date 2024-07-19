import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [MatSidenavModule, MatExpansionModule],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceMenuComponent {
  readonly panelOpenState = signal(false);
}
