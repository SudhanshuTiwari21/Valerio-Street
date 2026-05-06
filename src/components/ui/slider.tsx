"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-px w-full grow overflow-hidden bg-charcoal/20">
      <SliderPrimitive.Range className="absolute h-full bg-charcoal" />
    </SliderPrimitive.Track>
    {Array.from({ length: (props.value as number[])?.length ?? 1 }).map((_, i) => (
      <SliderPrimitive.Thumb
        key={i}
        className="block h-3 w-3 rounded-full border border-charcoal bg-bone transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
