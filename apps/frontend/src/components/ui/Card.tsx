import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'bordered' | 'elevated'
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
        const variants = {
            default: 'bg-white border border-secondary-200',
            bordered: 'bg-white border-2 border-secondary-300',
            elevated: 'bg-white shadow-lg border border-secondary-100'
        }

        const paddings = {
            none: '',
            sm: 'p-3',
            md: 'p-4',
            lg: 'p-6'
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-lg transition-all duration-200',
                    variants[variant],
                    paddings[padding],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('mb-4', className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)

CardHeader.displayName = 'CardHeader'

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={cn('text-xl font-semibold text-gray-900', className)}
                {...props}
            >
                {children}
            </h3>
        )
    }
)

CardTitle.displayName = 'CardTitle'

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn('text-sm text-secondary-600 mt-1', className)}
                {...props}
            >
                {children}
            </p>
        )
    }
)

CardDescription.displayName = 'CardDescription'

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> { }

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('', className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)

CardContent.displayName = 'CardContent'

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('mt-4 flex items-center gap-2', className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)

CardFooter.displayName = 'CardFooter'
