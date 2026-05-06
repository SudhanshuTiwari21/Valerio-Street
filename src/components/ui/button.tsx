"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-sans text-[11px] uppercase tracking-editorial transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default:
          "bg-charcoal text-bone hover:bg-ink hover:tracking-widest border border-charcoal",
        outline:
          "border border-charcoal/80 bg-transparent text-charcoal hover:bg-charcoal hover:text-bone",
        ghost: "bg-transparent text-charcoal hover:bg-charcoal/5",
        link: "bg-transparent text-charcoal underline-offset-4 hover:underline p-0",
        gold:
          "bg-gold text-charcoal hover:bg-[#a78a64] border border-gold",
        bone:
          "bg-bone text-charcoal hover:bg-sand/60 border border-charcoal/10",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive",
      },
      size: {
        default: "h-12 px-7",
        sm: "h-10 px-5",
        lg: "h-14 px-10 text-xs",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
