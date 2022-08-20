import React, { ReactNode } from 'react';

const TYPES = {
  info: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  success: 'bg-green-100 text-green-800',
  new: 'bg-blue-100 text-blue-800',
};

export function Badge({
  type = 'info',
  className,
  children,
}: {
  type?: keyof typeof TYPES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPES[type]} ${className || ''}`}
    >
      {children}
    </span>
  );
}
