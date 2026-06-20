import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { getStoredAccessToken } from '../idp-auth/auth-storage';
import { workflowConfig } from './workflow.config';
import { WorkflowRequestOptions } from './workflow.models';

@Injectable({ providedIn: 'root' })
export class WorkflowHttpService {
  constructor(private readonly http: HttpClient) {}

  async get<T>(route?: string, options?: WorkflowRequestOptions): Promise<T | null> {
    if (!workflowConfig.enabled) return null;

    const url = workflowConfig.buildUrl(route);
    const headers: Record<string, string> = { ...(options?.headers ?? {}) };
    const useAuth = options?.useAuth !== false;
    if (useAuth) {
      const token = getStoredAccessToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      return await firstValueFrom(this.http.get<T>(url, { headers }));
    } catch {
      return null;
    }
  }
}
