import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PermissionCheckerService {
  /** Podcast template has no ABP permission backend — grant all checks. */
  isGranted(_permissionName: string): boolean {
    return true;
  }
}
