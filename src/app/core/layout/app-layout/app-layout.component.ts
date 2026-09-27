import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { FooterComponent } from '../footer/footer.component';
import { LayoutService } from '../layout.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, BreadcrumbComponent, FooterComponent, ConfirmationDialogComponent],
  templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent {
  protected readonly layout = inject(LayoutService);
}
