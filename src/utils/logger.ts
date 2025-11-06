const isProd = import.meta.env.MODE === 'production';

export const debug = (...args: unknown[]) => {
  if (!isProd) console.debug('[debug]', ...args);
};

export const info = (...args: unknown[]) => {
  if (!isProd) console.info('[info]', ...args);
};

export const warn = (...args: unknown[]) => {
  // Warnings shown in all environments
  console.warn('[warn]', ...args);
};

export const error = (...args: unknown[]) => {
  // Errors shown in all environments
  console.error('[error]', ...args);
};

export default {
  debug,
  info,
  warn,
  error,
};
