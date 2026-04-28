"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  isClickable?: boolean; // New prop to control link wrapping
}

export default function LogoTextDark({
  className,
  width = 180,
  height = 60,
  isClickable = false, // Default to false to avoid nested link errors
}: LogoProps) {
  // The core Image element
  const LogoImage = (
    <Image
      src={"/images/darklogotext.png"}
      alt="Dishpatch Logo"
      width={width}
      height={height}
      priority
      className={cn("object-contain h-auto", className)}
    />
  );

  // Only wrap in a Link if explicitly requested
  if (isClickable) {
    return (
      <Link
        href="/"
        className="transition-all hover:opacity-80 active:scale-95 inline-block"
      >
        {LogoImage}
      </Link>
    );
  }

  return LogoImage;
}
