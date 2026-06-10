import { defineConfig } from 'vite';

export default defineConfig({
  // './' allows the build to work when deployed to a GitHub Pages subfolder
  base: './',
  build: {
    outDir: 'build',
    assetsDir: 'assets',
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
