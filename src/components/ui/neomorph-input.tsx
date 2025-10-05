import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface NeomorphInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const NeomorphInput = React.forwardRef<HTMLInputElement, NeomorphInputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(
      !!props.value || !!props.defaultValue,
    );

    return (
      <div className="relative">
        <motion.div
          className={cn(
            'relative rounded-xl transition-all duration-300',
            'shadow-2xl bg-background',
            isFocused && 'shadow-inner ring-2 ring-primary/20',
            error && 'ring-2 ring-destructive/50',
            className,
          )}
          animate={{
            boxShadow: isFocused
              ? 'inset 4px 4px 8px hsl(var(--neomorph-dark)), inset -4px -4px 8px hsl(var(--neomorph-light))'
              : '8px 8px 16px hsl(var(--neomorph-dark)), -8px -8px 16px hsl(var(--neomorph-light))',
          }}
        >
          <input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-xl bg-transparent px-4 py-3 text-sm ring-offset-background',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-muted-foreground focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              label && 'pt-6 pb-2',
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={e => {
              setIsFocused(false);
              setHasValue(!!e.target.value);
            }}
            onChange={e => {
              setHasValue(!!e.target.value);
              props.onChange?.(e);
            }}
            {...props}
          />

          {label && (
            <motion.label
              className={cn(
                'absolute left-4 text-muted-foreground pointer-events-none transition-all duration-200',
                isFocused || hasValue
                  ? 'top-2 text-xs text-primary'
                  : 'top-1/2 -translate-y-1/2 text-sm',
              )}
              animate={{
                y: isFocused || hasValue ? 0 : '-50%',
                fontSize: isFocused || hasValue ? '0.75rem' : '0.875rem',
                color:
                  isFocused || hasValue
                    ? 'hsl(var(--primary))'
                    : 'hsl(var(--muted-foreground))',
              }}
            >
              {label}
            </motion.label>
          )}
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-destructive mt-1 ml-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);
NeomorphInput.displayName = 'NeomorphInput';

export { NeomorphInput };
