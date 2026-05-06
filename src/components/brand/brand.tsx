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
  markEm = 3.1,
  markNudgeEm = 0.12,
  markInnerScale = 2.25,
  text = "Valerio Street",
  ariaLabel = "Valerio Street — home",
}: Readonly<{
  href?: string;
  className?: string;
  markClassName?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Mark box size relative to current font-size (em). */
  markEm?: number;
  /** Optical vertical nudge for the mark (em). */
  markNudgeEm?: number;
  /** Compensate for transparent padding inside the PNG. */
  markInnerScale?: number;
  text?: string;
  ariaLabel?: string;
}>) {
  const textBaseBySize = {
    sm: "text-lg tracking-[0.26em]",
    md: "text-2xl tracking-[0.30em]",
    lg: "text-3xl tracking-[0.32em]",
    xl: "text-4xl tracking-[0.32em]",
  } as const;
  const textBase = textBaseBySize[size];
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-3", className)}
    >
      <span
        className={cn(
          "relative shrink-0",
          markClassName,
        )}
        aria-hidden="true"
        style={{
          height: `${markEm}em`,
          width: `${markEm}em`,
          // Use translateY only via inline style so it can't be overridden by Tailwind classes.
          translate: `0 ${markNudgeEm}em`,
        }}
      >
        <Image
          src="/logo-trn.png"
          alt=""
          fill
          sizes="96px"
          className="object-contain"
          priority
          style={{ transform: `scale(${markInnerScale})` }}
        />
      </span>
      <span
        className={cn(
          "font-serif uppercase leading-none",
          textBase,
          textClassName,
        )}
      >
        {text}
      </span>
    </Link>
  );
}

