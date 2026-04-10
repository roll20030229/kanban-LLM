import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[10px] border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-[#f0f0f5] ring-offset-black transition-all duration-250 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white/22 focus-visible:shadow-[0_0_0_3px_rgba(255,255,255,0.06),0_0_20px_rgba(79,143,255,0.08)] focus-visible:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-[16px] saturate-[180%]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
