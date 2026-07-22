import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { cloudgateAuth } from '../cloudgate/cloudgate';
import { idpAuthConfig } from './idp-auth.config';
import { IdpProfile, IdpTokenResult } from './idp-profile.models';

@Injectable({ providedIn: 'root' })
export class IdpProfileService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Exchange the stored refresh token for new tokens.
   * Delegated to @cloudgatedevs/cloudgate-client, which also persists them.
   */
  async refreshToken(_refreshToken?: string): Promise<IdpTokenResult | null> {
    const refreshed = await cloudgateAuth().refresh();
    if (!refreshed) return null;
    return {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken ?? '',
      expiresIn: refreshed.expiresIn ?? 0,
      returnUrl: undefined,
    };
  }

  async getProfile(accessToken: string, tenancyName: string): Promise<IdpProfile | null> {
    const base = idpAuthConfig.apiUrl;
    if (!base || !tenancyName) return null;

    const url = `${base}/api/idp/${encodeURIComponent(tenancyName)}/profile`;
    try {
      const data = await firstValueFrom(
        this.http.get<Record<string, unknown>>(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      const r = (data?.['result'] as Record<string, unknown>) ?? data;
      if (!r || typeof r !== 'object' || r['id'] == null) return null;
      return {
        id: r['id'] as number | string,
        email: (r['email'] ?? r['Email']) as string | undefined,
        name: (r['name'] ?? r['Name']) as string | undefined,
        surname: (r['surname'] ?? r['Surname']) as string | undefined,
        photoUrl: (r['photoUrl'] ?? r['PhotoUrl'] ?? null) as string | null,
        role: (r['role'] ?? r['Role'] ?? null) as string | null,
      };
    } catch {
      return null;
    }
  }

  async updateProfile(
    accessToken: string,
    tenancyName: string,
    input: { name?: string; surname?: string; email?: string },
  ): Promise<IdpProfile | null> {
    const base = idpAuthConfig.apiUrl;
    if (!base || !tenancyName || !accessToken) return null;

    const url = `${base}/api/idp/${encodeURIComponent(tenancyName)}/profile`;
    try {
      const data = await firstValueFrom(
        this.http.put<Record<string, unknown>>(url, input, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      const r = (data?.['result'] as Record<string, unknown>) ?? data;
      if (!r || typeof r !== 'object') return null;
      const id = (r['id'] ?? r['Id']) as number | string | undefined;
      if (id == null && r['name'] == null && r['Name'] == null && r['email'] == null && r['Email'] == null) {
        return null;
      }
      return {
        id: id ?? 0,
        email: (r['email'] ?? r['Email']) as string | undefined,
        name: (r['name'] ?? r['Name']) as string | undefined,
        surname: (r['surname'] ?? r['Surname']) as string | undefined,
        photoUrl: (r['photoUrl'] ?? r['PhotoUrl'] ?? null) as string | null,
        role: (r['role'] ?? r['Role'] ?? null) as string | null,
      };
    } catch {
      return null;
    }
  }
}
