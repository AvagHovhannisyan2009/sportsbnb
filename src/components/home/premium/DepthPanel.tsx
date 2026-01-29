import { memo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DepthPanelProps {
  children: ReactNode;
  className?: string;
  depth?: 'shallow' | 'medium' | 'deep';
  hover?: boolean;
}

const depthStyles = {
  shallow: 'shadow-lg shadow-black/5',
  medium: 'shadow-xl shadow-black/10',
  deep: 'shadow-2xl shadow-black/15',
};

const hoverVariants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01 },
};

function DepthPanel({
  children,
  className = '',
  depth = 'medium',
  hover = true,
}: DepthPanelProps) {
  const baseClasses = cn(
    'relative bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden',
    depthStyles[depth],
    className
  );

  if (!hover) {
    return (
      <div className={baseClasses}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={baseClasses}
      initial="rest"
      whileHover="hover"
      variants={hoverVariants}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default memo(DepthPanel);
