import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages のサブパス (/threejs-export-scene-to-glb-ts/) でも動くよう相対パスで出力する
  base: './',
  build: {
    // three.js 本体だけで 500kB を超えるため、警告の閾値を引き上げる
    chunkSizeWarningLimit: 1000,
  },
});
