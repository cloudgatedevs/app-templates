import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  get(_name: string): string | undefined {
    return undefined;
  }

  getBoolean(_name: string): boolean {
    return false;
  }

  getInt(_name: string): number {
    return 0;
  }
}
