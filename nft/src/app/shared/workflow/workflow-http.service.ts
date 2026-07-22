// Workflow-gateway HTTP — powered by @cloudgatedevs/cloudgate-client.
import { Injectable } from '@angular/core';
import { cloudgateAuth, cloudgateClient } from '../cloudgate/cloudgate';
import { workflowConfig } from './workflow.config';
import { WorkflowRequestOptions } from './workflow.models';

@Injectable({ providedIn: 'root' })
export class WorkflowHttpService {
  async get<T>(route?: string, options?: WorkflowRequestOptions): Promise<T | null> {
    if (!workflowConfig.enabled) return null;
    const client = cloudgateClient();
    if (!client) return null;

    // workflowConfig builds the absolute URL (env + project path + per-app
    // default route); the client takes the path relative to the gateway origin.
    const url = workflowConfig.buildUrl(route);
    const path = url.slice(workflowConfig.gatewayUrl.length) || '/';

    const headers: Record<string, string> = { ...(options?.headers ?? {}) };
    if (options?.useAuth !== false) {
      Object.assign(headers, cloudgateAuth().authHeader());
    }

    try {
      return await client.get<T>(path, { headers });
    } catch {
      return null;
    }
  }
}
