import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export function WaveBackground({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div className={twMerge("absolute inset-x-0 bottom-0 overflow-hidden pointer-events-none z-0", className)} {...props}>
            <svg
                className="relative w-[200%] h-[50vh] min-h-[400px] left-0"
                viewBox="0 0 2880 320"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* 
           Layout Fix: 
           - Removed -left-[50%]. Now using left-0. 
           - Wrapper is 200% width. Animation slides -50% (one full screen width).
           - This ensures strictly seamless looping of the two identical wave cycles.
           
           Height Adjustment:
           - Restored Y values to ~100-160 range to make waves looking "tall" again.
           
           Animation:
           - Ultra slow speeds (60s-120s).
        */}

                {/* Layer 1: Secondary - Slowest, Background */}
                <path
                    fill="rgb(var(--color-secondary-500))"
                    fillOpacity="0.3"
                    className="animate-[wave_120s_linear_infinite]"
                    d="M0,192 Q360,140 720,192 T1440,192 T2160,192 T2880,192 V320 H0 Z"
                />

                {/* Layer 2: Tertiary - Medium, Reverse */}
                <path
                    fill="rgb(var(--color-tertiary-500))"
                    fillOpacity="0.5"
                    className="animate-[wave_90s_linear_infinite_reverse]"
                    d="M0,160 Q360,210 720,160 T1440,160 T2160,160 T2880,160 V320 H0 Z"
                />

                {/* Layer 3: Primary - Fastest, Foreground */}
                <path
                    fill="rgb(var(--color-primary-600))"
                    fillOpacity="0.8"
                    className="animate-[wave_60s_linear_infinite]"
                    d="M0,128 Q360,80 720,128 T1440,128 T2160,128 T2880,128 V320 H0 Z"
                />
            </svg>
        </div>
    );
}
