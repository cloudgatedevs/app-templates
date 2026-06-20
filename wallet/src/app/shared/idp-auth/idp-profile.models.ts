export interface IdpProfile {
  id: number | string;
  email?: string;
  name?: string;
  surname?: string;
  photoUrl?: string | null;
  role?: string | null;
}

export interface IdpTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  returnUrl?: string;
}

export function getProfilePictureSrc(profile?: { photoUrl?: string | null; PhotoUrl?: string | null }) {
  const photoUrl = profile?.photoUrl ?? profile?.PhotoUrl;
  return photoUrl && typeof photoUrl === 'string' ? photoUrl.trim() || undefined : undefined;
}
