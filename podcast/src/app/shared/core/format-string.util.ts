function replaceAll(str: string, search: string, replacement: string): string {
  const fix = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return str.replace(new RegExp(fix, 'g'), replacement);
}

export function formatString(template: string, ...args: unknown[]): string {
  let str = template;
  for (let i = 0; i < args.length; i++) {
    str = replaceAll(str, `{${i}}`, String(args[i] ?? ''));
  }
  return str;
}
