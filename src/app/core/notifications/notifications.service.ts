import { Injectable, inject, signal } from '@angular/core';
import { Socket, io } from 'socket.io-client';

import { HOA_API_BASE_URL } from '../api/api-config';
import { TokenStorageService } from '../auth/token-storage.service';
import { NotificationsApiService } from './data-access/notifications-api.service';
import { AppNotification } from './models/notification.model';

const MAX_DROPDOWN_ITEMS = 20;

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly api = inject(NotificationsApiService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly hoaApiBaseUrl = inject(HOA_API_BASE_URL);

  private readonly _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  private readonly _unreadCount = signal(0);
  readonly unreadCount = this._unreadCount.asReadonly();

  private socket: Socket | null = null;

  connect(): void {
    if (this.socket) return;

    this.loadInitial();

    const isAbsolute = /^https?:\/\//.test(this.hoaApiBaseUrl);
    this.socket = io(isAbsolute ? this.hoaApiBaseUrl : undefined, {
      path: isAbsolute ? undefined : `${this.hoaApiBaseUrl}/socket.io`,
      auth: (cb) => cb({ token: this.tokenStorage.current }),
    });

    this.socket.on('notification', (notification: AppNotification) => {
      this._notifications.update((list) => [notification, ...list].slice(0, MAX_DROPDOWN_ITEMS));
      if (!notification.read) this._unreadCount.update((count) => count + 1);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this._notifications.set([]);
    this._unreadCount.set(0);
  }

  markRead(notification: AppNotification): void {
    if (notification.read) return;
    this._notifications.update((list) =>
      list.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    );
    this._unreadCount.update((count) => Math.max(0, count - 1));
    this.api.markRead(notification.id).subscribe();
  }

  markAllRead(): void {
    if (this._unreadCount() === 0) return;
    this._notifications.update((list) => list.map((n) => ({ ...n, read: true })));
    this._unreadCount.set(0);
    this.api.markAllRead().subscribe();
  }

  private loadInitial(): void {
    this.api.list(1, MAX_DROPDOWN_ITEMS).subscribe((page) => this._notifications.set(page.items));
    this.api.unreadCount().subscribe(({ count }) => this._unreadCount.set(count));
  }
}
