'use client';
import { Input } from '@cinema/ui';
import { Checkbox } from '@cinema/ui';
import { useAdminLoginForm } from './AdminLoginForm.viewmodel';
import type { AdminLoginFormProps } from './types';

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M1.5 5.5l6.5 4.5 6.5-4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 1l14 14M6.5 6.6A2 2 0 0010 9.4M4.2 4.3C2.5 5.4 1 8 1 8s2.5 5 7 5a7 7 0 003.8-1.2M7 3.1A7 7 0 0115 8s-.9 1.8-2.2 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5L2.5 4v4.5C2.5 11.5 5 13.5 8 14.5c3-1 5.5-3 5.5-6V4L8 1.5z" stroke="#0047AB" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

export function AdminLoginForm({ redirectTo }: AdminLoginFormProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    keepSession,
    setKeepSession,
    showPassword,
    toggleShowPassword,
    error,
    isLoading,
    handleSubmit,
  } = useAdminLoginForm({ redirectTo });

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-[#E5F3FF] px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#0047AB]">
            Ingreso Seguro
          </p>
          <h1 className="mb-1 text-3xl font-bold text-gray-900">Iniciá sesión</h1>
          <p className="text-sm text-[#6A7D91]">
            Usá las credenciales que te entregó el administrador.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="email"
            label="Correo corporativo"
            type="email"
            placeholder="tu@megacinema.sv"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefix={<MailIcon />}
            required
          />

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <button
                type="button"
                className="text-xs text-[#0047AB] hover:underline"
                tabIndex={-1}
              >
                ¿Necesitás ayuda?
              </button>
            </div>
            <Input
              id="password"
              label=""
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefix={<LockIcon />}
              suffix={
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              }
              required
            />
          </div>

          <Checkbox
            id="keep-session"
            label="Mantener sesión activa por 12 horas"
            checked={keepSession}
            onChange={(e) => setKeepSession(e.target.checked)}
          />

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-[#0047AB] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#003380] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Verificando...' : 'Ingresar al panel'}
          </button>
        </form>

        {/* Role note */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#C7E1FF]/50 px-3 py-2.5">
          <span className="mt-0.5 shrink-0"><ShieldIcon /></span>
          <p className="text-xs text-[#6A7D91]">
            <span className="font-semibold text-gray-700">Acceso por rol.</span> El sistema detecta
            automáticamente si sos administrador o empleado y te muestra solo las secciones que
            podés usar.
          </p>
        </div>
      </div>
    </div>
  );
}
