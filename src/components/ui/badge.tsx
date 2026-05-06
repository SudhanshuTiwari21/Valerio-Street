import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-1 font-sans text-[10px] uppercase tracking-editorial",
  {
    variants: {
      variant: {
        default: "bg-charcoal text-bone",
        outline: "border border-charcoal/30 text-charcoal",
        sand: "bg-sand text-charcoal",
        gold: "bg-gold text-charcoal",
        muted: "bg-charcoal/5 text-charcoal/70",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
