// app/game/_components/ui/Button.jsx
'use client';

export default function Button({
                                 children,
                                 onClick,
                                 variant = 'primary',
                                 size = 'medium',
                                 disabled = false,
                                 className = '',
                                 ...props
                               }) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-950';

  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-green-500 text-gray-900 hover:from-emerald-400 hover:to-green-400 active:scale-95',
    secondary: 'bg-gray-800 text-green-300 border border-emerald-700 hover:bg-gray-700 hover:border-emerald-600',
    danger: 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500',
    ghost: 'text-green-300 hover:text-green-200 hover:bg-gray-800'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}