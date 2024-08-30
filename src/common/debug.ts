const IS_DEBUG = process.env.NODE_ENV === 'development';

export function debugThrow(message?: string) {
  if (IS_DEBUG) {
    throw new Error(message);
  } else {
    console.error('[nistate][throw]', message);
  }
}
