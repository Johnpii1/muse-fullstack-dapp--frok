import React from "react";

export interface CardProps {
  variant?: "default" | "mobile" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  padding = "md",
  hover = false,
  className = "",
  children,
}: CardProps) {
  const baseClasses = "rounded-lg border transition-all duration-300";

  const variants = {
    default: "border-secondary-200 bg-white shadow-sm",
    mobile:
      "border-secondary-200 bg-white shadow-sm mx-2 first:ml-4 last:mr-4 p-4",
    elevated: "border-secondary-200 bg-white shadow-md",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const classes = [
    baseClasses,
    variants[variant],
    variant !== "mobile" && paddings[padding],

    hover &&
      "hover:shadow-xl hover:scale-[1.02] hover:border-primary-300 active:scale-[0.98]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
