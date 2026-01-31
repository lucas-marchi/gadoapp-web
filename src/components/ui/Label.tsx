import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export function Label({ className, ...props }: ComponentProps<'label'>) {
    return (
        <label
            className={twMerge(
                "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1",
                className
            )}
            {...props}
        />
    );
}
