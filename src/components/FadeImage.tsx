import { type ImgHTMLAttributes, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

/** An <img> that fades in once it has loaded instead of popping in. */
const FadeImage = ({
  className,
  alt,
  onLoad,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { alt: string }) => {
  const [loaded, setLoaded] = useState(false)

  // A cached image can finish before React attaches onLoad
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true)
  }, [])

  return (
    <img
      ref={ref}
      alt={alt}
      onLoad={(e) => {
        setLoaded(true)
        onLoad?.(e)
      }}
      className={cn(
        'transition-opacity duration-200 ease-out-strong',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    />
  )
}

export default FadeImage
