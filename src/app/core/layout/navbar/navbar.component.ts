import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { notificationRoute } from '../../notifications/notification-routes';
import { AppNotification } from '../../notifications/models/notification.model';
import { NotificationsService } from '../../notifications/notifications.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, TimeAgoPipe],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected readonly layout = inject(LayoutService);
  protected readonly auth = inject(AuthService);
  protected readonly notifications = inject(NotificationsService);
  private readonly router = inject(Router);

  protected onLogout(): void {
    this.auth.logout().subscribe(() => {
      void this.router.navigate(['/login']);
    });
  }

  protected onNotificationClick(notification: AppNotification): void {
    this.notifications.markRead(notification);
    const route = notificationRoute(notification.entityType, notification.entityId);
    if (route) void this.router.navigate(route);
  }
}
