import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white/8 hover:bg-white/12 text-white border border-white/10 hover:border-white/18 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-[20px] saturate-[180%] active:bg-white/5 active:translate-y-0 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent",
        destructive: "bg-red-500/10 hover:bg-red-500/18 text-red-400 border border-red-500/20 hover:border-red-500/35 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-[20px] saturate-[180%] active:translate-y-0 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-red-500/25 before:to-transparent",
        outline: "border border-white/10 bg-transparent hover:bg-white/6 hover:border-white/16 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[20px] active:translate-y-0",
        secondary: "bg-white/[0.06] hover:bg-white/10 text-white/90 border border-white/10 hover:border-white/16 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[20px] saturate-[180%] active:translate-y-0 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        ghost: "hover:bg-white/6 hover:text-white border border-transparent hover:border-white/10 backdrop-blur-[16px]",
        link: "text-white/70 underline-offset-4 hover:text-white hover:underline",
        neon: "border border-white/15 bg-transparent hover:bg-white/6 text-white/90 hover:text-white hover:shadow-[0_0_30px_rgba(79,143,255,0.15),0_0_60px_rgba(168,85,247,0.1)] backdrop-blur-[20px] active:translate-y-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-[6px] px-3 text-xs",
        lg: "h-12 rounded-[14px] px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
