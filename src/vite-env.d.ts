/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_GEMINI_API_KEY: string;
  readonly VITE_HUGGINGFACE_API_KEY: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
