import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ButtonProps, buttonVariants } from '@/lib/props/ui/Button.props';
import { cn } from "@/lib/helpers/utils/utils"



const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
      {...props}
    />
  )
}
)
Button.displayName = "Button"

export { Button, buttonVariants }
