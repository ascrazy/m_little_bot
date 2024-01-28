import * as esbuild from 'esbuild'
import requireResolvePlugin from '@chialab/esbuild-plugin-require-resolve';

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  outdir: './build',
  plugins: [
    requireResolvePlugin(),
  ],
})