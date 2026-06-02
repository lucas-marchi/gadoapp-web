import { type ComponentProps, useId } from 'react';
import { twMerge } from 'tailwind-merge';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  label?: string;
  description?: string;
  variant?: 'primary' | 'danger';
}

export function Checkbox({
  label,
  description,
  variant = 'primary',
  className,
  checked,
  id: externalId,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = externalId || generatedId;

  const variantStyles = {
    primary: {
      ring: 'peer-focus-visible:ring-primary-500',
      checked: 'peer-checked:bg-primary-600 peer-checked:border-primary-600',
      label: 'text-neutral-900 dark:text-white',
    },
    danger: {
      ring: 'peer-focus-visible:ring-danger-500',
      checked: 'peer-checked:bg-danger-600 peer-checked:border-danger-600',
      label: 'text-danger-700 dark:text-danger-400',
    },
  };

  const styles = variantStyles[variant];

  return (
    <label
      htmlFor={inputId}
      className={twMerge(
        'group flex items-start gap-3 cursor-pointer select-none',
        props.disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          {...props}
          id={inputId}
          type="checkbox"
          checked={checked}
          className="peer sr-only"
        />
        <div
          className={twMerge(
            'w-5 h-5 rounded-md border-2 border-neutral-300 dark:border-neutral-500',
            'bg-white dark:bg-neutral-700',
            'transition-all duration-150',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-neutral-800',
            styles.ring,
            styles.checked,
            'flex items-center justify-center'
          )}
        >
          <Check
            size={14}
            strokeWidth={3}
            className={twMerge(
              'text-white transition-all duration-150',
              checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            )}
          />
        </div>
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className={twMerge('text-sm font-medium leading-tight', styles.label)}>
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}
