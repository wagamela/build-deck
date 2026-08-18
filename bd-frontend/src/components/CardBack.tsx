interface CardBackProps {
  color: string
}

export default function CardBack({ color }: CardBackProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-lg border border-line"
      style={{ backgroundColor: color }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-md border border-line bg-surface/60">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="6.2"
            y="3"
            width="12.5"
            height="17"
            rx="3"
            fill="#6e79d6"
            opacity="0.55"
            transform="rotate(-8 6.2 3)"
          />
          <rect
            x="5"
            y="4.8"
            width="12.5"
            height="17"
            rx="3"
            fill="#5e6ad2"
            opacity="0.35"
            transform="rotate(5 5 4.8)"
          />
        </svg>
      </div>
    </div>
  )
}