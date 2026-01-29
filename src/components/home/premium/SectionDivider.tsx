import { memo } from 'react';

interface SectionDividerProps {
  className?: string;
}

function SectionDivider({ className = '' }: SectionDividerProps) {
  return (
    <div className={`relative h-px ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    </div>
  );
}

export default memo(SectionDivider);
