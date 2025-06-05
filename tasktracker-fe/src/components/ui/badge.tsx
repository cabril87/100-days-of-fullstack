import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        warning: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        info: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
        danger: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Whether the badge should have a hover state
   */
  interactive?: boolean;
  /**
   * Accessibility properties for the badge
   */
  ariaBusy?: boolean;
  ariaLabel?: string;
}

function Badge({
  className,
  variant,
  interactive = false,
  ariaBusy,
  ariaLabel,
  ...props
}: BadgeProps) {
  const baseClasses = badgeVariants({ variant })
  const classes = cn(
    baseClasses,
    !interactive && "hover:bg-none",
    className
  )
  
  return (
    <div 
      className={classes} 
      aria-busy={ariaBusy}
      aria-label={ariaLabel}
      role="status"
      {...props} 
    />
  )
}

export { Badge, badgeVariants } 