import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
    return (
        <textarea
            className={twMerge(
                "w-full p-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl",
                "text-neutral-900 dark:text-white focus:ring-2 focus:ring-secondary-500 outline-none transition-all",
                "placeholder-neutral-400 dark:placeholder-neutral-500 resize-y",
                className
            )}
            {...props}
        />
    );
}
