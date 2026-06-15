'use client';

import type { BadgeProps } from './types';

const variantClasses = {
  default: 'bg-gray-200 text-gray-900',
  success: 'bg-green-200 text-green-900',
  warning: 'bg-amber-200 text-amber-900',
  error: 'bg-red-200 text-red-900',
  info: 'bg-blue-200 text-blue-900',
} as const;

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
} as const;

export function Badge({
  children,
  variant = 'default',
  size = 'md',
}: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full font-semibold ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
}
