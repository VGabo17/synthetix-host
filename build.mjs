// Empaqueta React + componentes en assets/js/dist (el sitio se sirve estático en GitHub Pages).
import { build, context } from 'esbuild'

const options = {
  entryPoints: {
    app: 'src/index.jsx',
    ui: 'src/ui.js'
  },
  outdir: 'assets/js/dist',
  bundle: true,
  splitting: true,
  format: 'esm',
  minify: true,
  target: ['es2020'],
  jsx: 'automatic',
  loader: { '.svg': 'text' },
  external: ['assets/*'],
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info'
}

if (process.argv.includes('--watch')) {
  const ctx = await context(options)
  await ctx.watch()
} else {
  await build(options)
}
