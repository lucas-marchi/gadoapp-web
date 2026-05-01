import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function Divider({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={twMerge("relative my-6 text-center select-none", className)}
      {...props}
    >
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-neutral-200 dark:border-neutral-700/50"></div>
      </div>
      <span className="relative bg-white/70 dark:bg-neutral-800/60 backdrop-blur-xl px-4 text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400">
        {children}
      </span>
    </div>
  );
}
