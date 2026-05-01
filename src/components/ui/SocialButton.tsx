import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface SocialButtonProps extends ComponentProps<"button"> {
  icon: ReactNode;
  variant?: "google" | "facebook";
}

export function SocialButton({
  className,
  icon,
  children,
  variant = "google",
  ...props
}: SocialButtonProps) {
  const variants = {
    google:
      "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700/50",
    facebook: "bg-[#1877F2] text-white hover:bg-[#1864D9] border-transparent", // Facebook Brand Color
  };

  return (
    <button
      className={twMerge(
        "flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl font-medium transition-all shadow-sm active:scale-[0.98]",
        variants[variant],
        className,
      )}
      {...props}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span>{children}</span>
    </button>
  );
}
