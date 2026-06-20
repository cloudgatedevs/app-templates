import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  debug(logObject: unknown): void {
    console.debug(logObject);
  }

  info(logObject: unknown): void {
    console.info(logObject);
  }

  warn(logObject: unknown): void {
    console.warn(logObject);
  }

  error(logObject: unknown): void {
    console.error(logObject);
  }

  fatal(logObject: unknown): void {
    console.error(logObject);
  }
}
