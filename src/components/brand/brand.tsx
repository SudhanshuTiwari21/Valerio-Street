"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({
  href = "/",
  className,
  markClassName,
  textClassName,
  size = "md",
  text = "Valerio Street",
  ariaLabel = "Valerio Street — home",
}: Readonly<{
  href?: string;
  className?: string;
  markClassName?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
  ariaLabel?: string;
}>) {
  const markBaseBySize = {
    sm: "h-9 w-9",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  } as const;
  const textBaseBySize = {
    sm: "text-lg tracking-[0.26em]",
    md: "text-2xl tracking-[0.30em]",
    lg: "text-3xl tracking-[0.32em]",
  } as const;
  const markBase = markBaseBySize[size];
  const textBase = textBaseBySize[size];
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-3", className)}
    >
      <span className={cn("relative shrink-0", markBase, markClassName)} aria-hidden="true">
        <Image src="/logo-trn.png" alt="" fill sizes="48px" className="object-contain" priority />
      </span>
      <span
        className={cn(
          "font-serif uppercase leading-none translate-y-[1px]",
          textBase,
          textClassName,
        )}
      >
        {text}
      </span>
    </Link>
  );
}

