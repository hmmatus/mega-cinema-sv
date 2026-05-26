import type { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  id: string;
  label: string;
}

export function Checkbox({ id, label, className = '', ...props }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        className={`h-4 w-4 rounded border-gray-300 accent-[#0047AB] cursor-pointer ${className}`}
        {...props}
      />
      <label htmlFor={id} className="text-sm text-gray-600 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
}
