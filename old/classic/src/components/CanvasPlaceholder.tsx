import React from 'react';

type Props = {
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'rounded';
  className?: string;
};

export default function CanvasPlaceholder({ label, size = 'md', shape = 'rounded', className = '' }: Props) {
  const sizes: Record<string, string> = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-24 h-24 text-xl',
    lg: 'w-32 h-32 text-2xl',
  };
  const shapeCls = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const initials = label ? String(label).trim().split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() : '';

  return (
    <div className={`flex items-center justify-center ${sizes[size]} ${shapeCls} bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800 ${className}`}>
      {initials || <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="6" fill="#e6e7eb"/></svg>}
    </div>
  );
}
