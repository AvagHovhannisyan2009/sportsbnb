import { memo } from 'react';

interface SectionDivider3DProps {
  variant?: 'wave' | 'dots' | 'gradient';
  className?: string;
}

function SectionDivider3D({ variant = 'wave', className = '' }: SectionDivider3DProps) {
  if (variant === 'dots') {
    return (
      <div className={`relative h-16 overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/30 animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={`relative h-24 overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
      </div>
    );
  }

  // Wave variant (default)
  return (
    <div className={`relative h-20 overflow-hidden ${className}`}>
      <svg
        className="absolute bottom-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 1200 120"
      >
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z"
          fill="url(#wave-gradient)"
          className="animate-[wave_8s_ease-in-out_infinite]"
        />
      </svg>
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-2%); }
        }
      `}</style>
    </div>
  );
}

export default memo(SectionDivider3D);
