interface CardBackProps {
  color: string
}

export default function CardBack({ color }: CardBackProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-[1.5rem] border border-white/60 shadow-back"
      style={{ backgroundColor: color }}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-[1.25rem] border border-white/50 bg-white/30">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="6.2"
            y="3"
            width="12.5"
            height="17"
            rx="3"
            fill="white"
            opacity="0.95"
            transform="rotate(-8 6.2 3)"
          />
          <rect
            x="5"
            y="4.8"
            width="12.5"
            height="17"
            rx="3"
            fill="white"
            opacity="0.5"
            transform="rotate(5 5 4.8)"
          />
        </svg>
      </div>
    </div>
  )
}