import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98] hover:-translate-y-[1px] active:translate-y-0 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-primary to-[#082E6E] text-primary-foreground hover:from-[#082E6E] hover:to-[#051E4A] hover:shadow-md hover:shadow-primary/10",
        destructive:
          "bg-gradient-to-br from-destructive to-[#C8102E] text-white hover:from-[#C8102E] hover:to-[#A00D24] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 hover:shadow-md hover:shadow-destructive/10",
        outline:
          "border border-border bg-white text-foreground hover:bg-muted/80 hover:border-slate-300 hover:shadow",
        secondary:
          "bg-gradient-to-br from-secondary to-[#A00D24] text-secondary-foreground hover:from-[#A00D24] hover:to-[#7E0A1B] hover:shadow-md hover:shadow-secondary/10",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 shadow-none border-transparent active:scale-95 hover:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline shadow-none border-transparent active:scale-100 hover:translate-y-0",
      },
      size: {
        default: "h-9.5 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-xl px-6 has-[>svg]:px-4 text-base",
        icon: "size-9.5 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
