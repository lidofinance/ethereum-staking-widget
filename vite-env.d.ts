/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IPFS_MODE?: string;
  readonly VITE_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Static define from vite.config.ts — replaces webpack-preprocessor-loader.
declare const __IPFS_MODE__: boolean;
