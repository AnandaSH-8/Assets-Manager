import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  hover?: boolean;
  blur?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export function GlassCard({
  children,
  className,
  hover = false,
  blur = 'md',
  style,
}: GlassCardProps) {
  const blurClass = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  }[blur];

  const baseClasses = cn(
    'bg-gradient-glass border border-white/20 rounded-2xl shadow-2xl',
    blurClass,
    'dark:border-white/10 dark:bg-gradient-glass',
    hover && 'cursor-pointer',
    className,
  );

  if (hover) {
    return (
      <motion.div
        className={baseClasses}
        style={style}
        whileHover={{
          scale: 1.02,
          boxShadow: 'var(--shadow-hover)',
        }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} style={style}>
      {children}
    </div>
  );
}
