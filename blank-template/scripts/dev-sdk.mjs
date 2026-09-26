import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer, mergeConfig } from 'vite';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export async function startLocalSdk(extraConfig = {}) {
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
function option(name) {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}
const sdk = path.resolve(root, option('--sdk') || process.env.CLOUDGATE_SDK_PATH || '../../client');
const manifest = JSON.parse(await readFile(path.join(sdk, 'package.json'), 'utf8').catch(() => {
  throw new Error(`No SDK checkout at ${sdk}. Use npm run dev:sdk -- --sdk "D:/repos/GitHub/client".`);
}));
if (manifest.name !== '@cloudgatedevs/cloudgate-client') throw new Error(`Not a Cloudgate SDK checkout: ${sdk}`);
const { default: preset } = await import(pathToFileURL(path.join(sdk, 'tailwind.preset.js')).href);
const base = (await import('../vite.config.js')).default;
const config = typeof base === 'function' ? base({ command: 'serve', mode: 'development' }) : base;
const source = name => path.join(sdk, name).replaceAll('\\', '/');
const aliases = [
  { find: /^@cloudgatedevs\/cloudgate-client\/react\/widgets$/, replacement: source('src/react/widgets/index.jsx') },
  { find: /^@cloudgatedevs\/cloudgate-client\/widgets\/catalog$/, replacement: source('src/widgets/catalog.js') },
  { find: /^@cloudgatedevs\/cloudgate-client\/react\/styles\.css$/, replacement: source('src/react/styles.css') },
  { find: /^@cloudgatedevs\/cloudgate-client\/react$/, replacement: source('src/react/index.jsx') },
  { find: /^@cloudgatedevs\/cloudgate-client\/platform$/, replacement: source('src/platform/index.js') },
  { find: /^@cloudgatedevs\/cloudgate-client$/, replacement: source('src/index.js') },
];
const server = await createServer(mergeConfig(mergeConfig(config, {
  configFile: false, root,
  // Source aliases let Vite watch the checkout directly. No npm link, package write, or build required.
  // Portaled SDK dropdowns and app dialogs must share their focus/layer contexts,
  // even though source imports resolve through two separate node_modules trees.
  resolve: { alias: aliases, dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom', 'lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dismissable-layer', '@radix-ui/react-focus-scope', '@radix-ui/react-focus-guards'] },
  // Prebundle the lazy photo editor too, so opening it for the first time does not
  // trigger Vite's dependency-discovery reload and discard the open dialog.
  optimizeDeps: { exclude: ['@cloudgatedevs/cloudgate-client'], include: ['@uppy/core', '@uppy/react/lib/Dashboard.js', '@uppy/webcam', 'react-easy-crop'] },
  css: { postcss: { plugins: [tailwind({ ...preset, content: [root.replaceAll('\\', '/') + '/src/**/*.{js,jsx}', source('src/**/*.{js,jsx}')] }), autoprefixer()] } },
  server: { host: option('--host') || '127.0.0.1', port: Number(option('--port') || 3000), strictPort: true, fs: { allow: [root, sdk] } },
}), extraConfig));
console.log(`Using local Cloudgate SDK source: ${sdk}`);
await server.listen();
server.printUrls();
return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = await startLocalSdk();
  const stop = async () => { await server.close(); process.exit(0); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}
