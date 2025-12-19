"use client";

import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

export interface CTAButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** If provided, renders as a Link instead of a button */
  href?: string;
  /** Visual style variant */
  variant?: "primary" | "secondary";
  /** Button content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const baseStyles = {
  border: "0.9px solid black",
  borderRadius: "11.28px",
  backgroundColor: "#D1EBF7",
  color: "black",
};

const variantStyles = {
  primary: {
    backgroundColor: "#D1EBF7",
  },
  secondary: {
    backgroundColor: "transparent",
  },
};

/**
 * Shared CTA button component with consistent styling.
 * Can render as either a button or a Link.
 *
 * @example
 * // As a button
 * <CTAButton onClick={handleClick}>Click Me</CTAButton>
 *
 * // As a link
 * <CTAButton href="/preorder">Pre-order Now</CTAButton>
 */
export function CTAButton({
  href,
  variant = "primary",
  children,
  className = "",
  style,
  ...buttonProps
}: CTAButtonProps) {
  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...style,
  };

  const combinedClassName = `inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-opacity hover:opacity-80 ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName} style={combinedStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={combinedClassName}
      style={combinedStyles}
      {...buttonProps}
    >
      {children}
    </button>
  );
}

export default CTAButton;
