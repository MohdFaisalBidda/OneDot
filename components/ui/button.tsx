import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        heroDark: `
          relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] 
          text-white overflow-hidden rounded-full
          after:content-[''] after:absolute after:inset-0 after:overflow-hidden
          after:skew-x-[-45deg] after:transform
          after:bg-[radial-gradient(circle_at_center,hsla(0,0%,100%,0.5),hsla(0,0%,100%,0)_70%)]
          after:animate-shine
          before:content-[''] before:absolute before:left-0 before:top-[-0.5px] 
          before:w-20 before:sm:w-24 before:md:w-28 before:lg:w-44 before:h-[41px]
          before:bg-gradient-to-b before:from-[rgba(255,255,255,0)] before:to-[rgba(0,0,0,0.10)] 
          before:mix-blend-multiply
          hover:bg-[#37322F]/90
        `,
        heroLight: `
  relative bg-white shadow-[0px_0px_0px_2.5px_rgba(0,0,0,0.08)_inset] 
  text-gray-900 overflow-hidden rounded-full
  after:content-[''] after:absolute after:inset-0 after:overflow-hidden
  after:skew-x-[-45deg] after:transform
  after:bg-[radial-gradient(circle_at_center,hsla(0,0%,100%,0.9),hsla(0,0%,100%,0)_70%)]
  after:animate-shine
  before:content-[''] before:absolute before:left-0 before:top-[-0.5px] 
  before:w-20 before:sm:w-24 before:md:w-28 before:lg:w-44 before:h-[41px]
  before:bg-gradient-to-b before:from-[rgba(255,255,255,0)] before:to-[rgba(0,0,0,0.05)] 
  before:mix-blend-multiply
  hover:bg-gray-50
`,
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        hero: "h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
