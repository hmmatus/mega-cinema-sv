export const ERROR_MESSAGES = {
  invalidCredentials: 'Credenciales inválidas. Verificá tu correo y contraseña.',
  noRole: 'Tu cuenta no tiene acceso a este panel. Contactá al administrador.',
  connectionError: 'Error de conexión. Intentá de nuevo.',
} as const;

export const ALLOWED_ROLES = ['admin', 'employee'] as const;
