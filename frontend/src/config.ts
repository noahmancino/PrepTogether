// Backend connection details are injected at build time via Vite environment
// variables so the frontend can target different hosts/ports in development or
// production without code changes.
export const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST ?? 'localhost';
export const BACKEND_PORT = Number(import.meta.env.VITE_BACKEND_PORT ?? 8000);
