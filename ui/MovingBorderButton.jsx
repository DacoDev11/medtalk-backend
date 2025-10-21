import React from 'react';

/**
 * MovingBorderButton
 * A highly-polished, professional button with an animated moving border.
 * Tailwind-only implementation, no external CSS files.
 */
export default function MovingBorderButton({
  children,
  className = '',
  as: Component = 'button',
  borderColors = [
    '#22d3ee', // cyan-400
    '#a78bfa', // violet-400
    '#f472b6', // pink-400
    '#22d3ee',
  ],
  rounded = 'rounded-xl',
  borderWidth = 2,
  glow = true,
  ...props
}) {
  // Compose a conic-gradient from configurable colors
  const gradient = `conic-gradient(from 0deg, ${borderColors.join(', ')})`;

  return (
    <Component
      className={[
        'relative inline-flex items-center justify-center select-none',
        'px-5 py-3 font-medium text-white transition-transform duration-200',
        'active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-400',
        rounded,
        className,
      ].join(' ')}
      {...props}
    >
      {/* Border wrapper */}
      <span
        aria-hidden
        className={`absolute inset-0 ${rounded} p-[1px]`}
        style={{
          WebkitMask:
            'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          background: gradient,
          animation: 'spin-slow 3s linear infinite',
          filter: glow ? 'drop-shadow(0 0 10px rgba(167,139,250,0.45))' : undefined,
        }}
      />

      {/* Inner surface */}
      <span
        className={`relative ${rounded} w-full h-full bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm`}
      />

      {/* Content layer */}
      <span className="absolute inset-0 grid place-items-center">
        {children}
      </span>

      {/* Keyframes via inline <style> to avoid external CSS */}
      <style>{`
        @keyframes spin-slow { to { transform: rotate(360deg); } }
      `}</style>
    </Component>
  );
}
