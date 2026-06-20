export function getCookieValue(key: string): string | null {
  const equalities = document.cookie.split('; ');
  for (const equality of equalities) {
    if (!equality) continue;
    const splitted = equality.split('=');
    if (splitted.length !== 2) continue;
    if (decodeURIComponent(splitted[0]) === key) {
      return decodeURIComponent(splitted[1] || '');
    }
  }
  return null;
}

export function setCookieValue(
  key: string,
  value?: string,
  expireDate?: Date,
  path?: string,
  domain?: string,
  attributes?: Record<string, string | boolean>,
): void {
  let cookieValue = `${encodeURIComponent(key)}=`;
  if (value) cookieValue += encodeURIComponent(value);
  if (expireDate) cookieValue += `; expires=${expireDate.toUTCString()}`;
  if (path) cookieValue += `; path=${path}`;
  if (domain) cookieValue += `; domain=${domain}`;
  if (attributes) {
    for (const name of Object.keys(attributes)) {
      if (!attributes[name]) continue;
      cookieValue += `; ${name}`;
      if (attributes[name] !== true) {
        cookieValue += `=${String(attributes[name]).split(';')[0]}`;
      }
    }
  }
  document.cookie = cookieValue;
}

export function deleteCookie(key: string, path?: string): void {
  let cookieValue = `${encodeURIComponent(key)}=; expires=${new Date(0).toUTCString()}`;
  if (path) cookieValue += `; path=${path}`;
  document.cookie = cookieValue;
}
