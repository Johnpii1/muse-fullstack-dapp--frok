import React from "react";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  children,
  disabled = false,
  onClick,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none touch-manipulation";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 hover:shadow-lg active:bg-primary-800 active:scale-95",
    secondary:
      "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 hover:scale-105 hover:shadow-md active:bg-secondary-300 active:scale-95",
    outline:
      "border border-secondary-300 bg-transparent hover:bg-secondary-50 hover:scale-105 hover:shadow-sm active:bg-secondary-100 active:scale-95",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm min-h-[36px]",
    md: "px-4 py-2 text-sm min-h-[44px]",
    lg: "px-6 py-3 text-base min-h-[48px]",
  };

  const classes = [
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      )}
      {children}
    </button>
  );
}
