import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-blue-200/50 bg-blue-50/80 text-[#0A3D91] dark:bg-primary/20 dark:text-primary-foreground",
        secondary:
          "border-red-200/50 bg-red-50/80 text-[#C8102E] dark:bg-secondary/20 dark:text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground border-border bg-white hover:bg-muted/80",
        success:
          "border-emerald-200/50 bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
        warning:
          "border-amber-200/50 bg-amber-50/80 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
