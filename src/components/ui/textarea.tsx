import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-[10px] border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-[#f0f0f5] ring-offset-black placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white/22 focus-visible:shadow-[0_0_0_3px_rgba(255,255,255,0.06),0_0_20px_rgba(79,143,255,0.08)] focus-visible:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-250 backdrop-blur-[16px] saturate-[180%]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
