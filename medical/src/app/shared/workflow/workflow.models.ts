export interface WorkflowRequestOptions {
  /** Attach Bearer token from IdP session when true (default). */
  useAuth?: boolean;
  headers?: Record<string, string>;
}
