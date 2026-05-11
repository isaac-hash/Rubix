"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-[#10b981] text-[#0b0f10] hover:bg-[#059669]",
      secondary: "bg-[#181c1d] text-[#e0e3e4] hover:bg-[#272b2c]",
      outline: "border border-[#1c2021] bg-transparent hover:bg-[#181c1d] text-[#10b981]",
      ghost: "bg-transparent hover:bg-[#181c1d] text-[#86948a] hover:text-white",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider",
      md: "px-4 py-2.5 text-[13px] font-medium",
      lg: "px-6 py-3 text-sm font-semibold",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative inline-flex items-center justify-center rounded-[4px] transition-colors disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="uppercase tracking-widest text-[10px]">Processing</span>
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
