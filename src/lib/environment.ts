/**
 * Detecta el entorno de ejecución utilizando las variables de entorno de Vite.
 * import.meta.env.MODE es configurado automáticamente por Vite a 'development' o 'production'.
 */
export const isDevelopment = import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.MODE === 'production';

/**
 * En desarrollo, podemos optar por apagar la confirmación de email temporalmente
 * para evitar el límite de 4 emails/hora de Supabase (Error 429).
 * En producción, esto DEBE ser true.
 */
export const requiresEmailConfirmation = isProduction;
