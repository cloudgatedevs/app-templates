import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FeatureCheckerService {
  get(_featureName: string): undefined {
    return undefined;
  }

  getValue(_featureName: string): undefined {
    return undefined;
  }

  isEnabled(_featureName: string): boolean {
    return false;
  }
}
