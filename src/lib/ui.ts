import { cva } from 'class-variance-authority'

/** The portfolio's glowing primary / outlined mono buttons. Add hover extras with `cn()`. */
export const siteButton = cva(
  'rounded-md text-sm font-mono-jb transition-[transform,background-color,color,border-color,box-shadow] duration-[160ms] ease-out-strong active:scale-[0.97]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.25)]',
        outline: 'border border-border',
      },
      size: {
        md: 'px-4 py-2',
        lg: 'px-6 py-3 font-medium',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

/** Contact form text fields */
export const fieldClass =
  'w-full px-4 py-3 text-sm rounded-md border border-border bg-transparent outline-none focus:border-primary/50 transition-colors'
