import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { HoaConfiguration, UpdateHoaConfigurationRequest } from '../models/hoa-configuration.model';

@Injectable({ providedIn: 'root' })
export class ConfigurationApiService {
  private readonly hoaApi = inject(HoaApiService);

  get(): Observable<HoaConfiguration> {
    return this.hoaApi.get<HoaConfiguration>('/configuration');
  }

  update(payload: UpdateHoaConfigurationRequest): Observable<HoaConfiguration> {
    return this.hoaApi.patch<HoaConfiguration>('/configuration', payload);
  }
}
