"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-[10px] font-bold text-[#86948a] uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            type={inputType}
            className={cn(
              "flex h-11 w-full rounded-[4px] border border-[#1c2021] bg-[#0b0f10] px-4 py-2 text-sm text-white transition-all",
              "placeholder:text-[#313536] focus:border-[#10b981] outline-none disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-rose-500/50" : "group-hover:border-[#313536]",
              isPassword && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86948a] hover:text-[#10b981] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider ml-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
