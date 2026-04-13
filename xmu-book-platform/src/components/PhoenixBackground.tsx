interface PhoenixBackgroundProps {
  className?: string
}

export function PhoenixBackground({ className }: PhoenixBackgroundProps) {
  return <div className={`phoenix-bg ${className ?? ''}`} aria-hidden="true" />
}
