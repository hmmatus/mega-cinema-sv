import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export function Input({ id, label, error, prefix, suffix, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="pointer-events-none absolute left-3 flex items-center text-gray-400">
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors outline-none
            ${prefix ? 'pl-9' : ''}
            ${suffix ? 'pr-10' : ''}
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-gray-300 focus:border-[#0047AB] focus:ring-2 focus:ring-[#C7E1FF]'
            }
            ${className}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 flex items-center">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
