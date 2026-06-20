import { DateTime } from 'luxon';

export class UserLoginInfoDto {
  name?: string;
  surname?: string;
  userName?: string;
  emailAddress?: string;
  profilePictureId?: string;
  friendCode?: string;
  id!: number;

  constructor(data?: Partial<UserLoginInfoDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class TenantLoginInfoDto {
  tenancyName?: string;
  name?: string;
  communityCodeImageId?: string;
  id?: number;
  [key: string]: unknown;

  constructor(data?: Partial<TenantLoginInfoDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class ApplicationInfoDto {
  version?: string;
  releaseDate?: DateTime | any;
  currency?: string;
  currencySign?: string;
  [key: string]: unknown;

  constructor(data?: Partial<ApplicationInfoDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class AppInformationDto {
  appUrl?: string;
  saaSType?: number;
  iconId?: string;
  appName?: string;
  appSubText?: string;

  constructor(data?: Partial<AppInformationDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
