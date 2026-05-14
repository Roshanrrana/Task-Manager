/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Full base URL for API calls, e.g. https://your-api.onrender.com/api. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
