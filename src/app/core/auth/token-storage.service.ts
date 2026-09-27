import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly accessToken = signal<string | null>(null);

  get current(): string | null {
    return this.accessToken();
  }

  set(token: string | null): void {
    this.accessToken.set(token);
  }

  clear(): void {
    this.accessToken.set(null);
  }
}
