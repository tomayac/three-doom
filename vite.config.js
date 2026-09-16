import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { cosPlugin } from 'vite-plugin-cross-origin-storage';

// The game fetches these at runtime by relative URL, so Vite never sees them
// as imports. They stay in the repository root rather than moving to public/
// because the tests read `../doom1.wad`, and leaving them in place keeps the
// tree identical to upstream so merging mrdoob/three-doom doesn't conflict.
// The dev server already serves them from the root; this copies them into the
// build.
const ROOT_ASSETS = ['doom1.wad', 'M_CONT.png'];

function copyRootAssets() {
  return {
    name: 'copy-root-assets',
    apply: 'build',
    generateBundle() {
      for (const fileName of ROOT_ASSETS) {
        this.emitFile({
          type: 'asset',
          fileName,
          source: readFileSync(new URL(fileName, import.meta.url)),
        });
      }
    },
  };
}

export default defineConfig({
  // Startup probes for doom2.wad, doom.wad, and friends before settling on
  // doom1.wad. The default 'spa' app type answers those with index.html and a
  // 200, which the probe takes for an IWAD. 'mpa' makes them 404, like Pages.
  appType: 'mpa',
  base: '/three-doom/',
  plugins: [
    copyRootAssets(),
    cosPlugin({
      packages: [/^three(\/|$)/],
    }),
  ],
  build: {
    outDir: 'docs',
    target: 'esnext',
  },
  server: {
    open: true,
  },
});
