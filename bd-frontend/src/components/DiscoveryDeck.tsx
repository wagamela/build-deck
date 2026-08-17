import { useEffect, useRef, useState } from 'react'
import type {
  PointerEvent as ReactPointerEvent,
  TransitionEvent as ReactTransitionEvent,
} from 'react'
import { projects } from '../data/projects'
import SwipeCard from './SwipeCard'

const SWIPE_THRESHOLD = 100
const TILT_PER_PX = 0.08
const MAX_TILT = 18
const FLYOUT_MS = 600

interface DragState {
  pointerId: number
  startX: number
  startY: number
}

export default function DiscoveryDeck() {
  const [counter, setCounter] = useState(0)
  const [dx, setDx] = useState(0)
  const [dy, setDy] = useState(0)
  const [leaving, setLeaving] = useState<'left' | 'right' | null>(null)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<DragState | null>(null)
  const leavingRef = useRef<'left' | 'right' | null>(null)

  useEffect(() => {
    leavingRef.current = leaving
  }, [leaving])

  const topIndex = counter % projects.length
  const stack = [0, 1, 2].map((offset) => ({
    project: projects[(topIndex + offset) % projects.length],
    key: counter + offset,
    offset,
  }))

  const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, dx * TILT_PER_PX))
  const likeProgress = Math.min(Math.max(dx / SWIPE_THRESHOLD, 0), 1)
  const skipProgress = Math.min(Math.max(-dx / SWIPE_THRESHOLD, 0), 1)

  function advance() {
    setCounter((value) => value + 1)
    setDx(0)
    setDy(0)
    setLeaving(null)
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (leaving) return
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    setDx(event.clientX - drag.startX)
    setDy(event.clientY - drag.startY)
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    setDragging(false)

    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      const direction = dx > 0 ? 'right' : 'left'
      setLeaving(direction)
      window.setTimeout(() => {
        if (leavingRef.current) advance()
      }, FLYOUT_MS)
    } else {
      setDx(0)
      setDy(0)
    }
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    setDragging(false)
    setDx(0)
    setDy(0)
  }

  function handleTransitionEnd(event: ReactTransitionEvent<HTMLDivElement>) {
    if (!leaving || event.propertyName !== 'transform') return
    advance()
  }

  const transform =
    leaving === 'right'
      ? 'translateX(170%) rotate(24deg)'
      : leaving === 'left'
        ? 'translateX(-170%) rotate(-24deg)'
        : `translate(${dx}px, ${dy}px) rotate(${tilt}deg)`

  const topTransitionClass = leaving
    ? 'transition-transform duration-500 ease-out'
    : dragging
      ? ''
      : 'transition-transform duration-300 ease-spring'

  return (
    <div className="relative h-[min(70vh,34rem)] w-[min(92vw,26rem)] select-none">
      {stack.map(({ project, key, offset }) => {
        if (offset === 0) {
          return (
            <div
              key={key}
              className={`absolute inset-0 z-20 touch-none will-change-transform ${topTransitionClass}`}
              style={{ transform }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onTransitionEnd={handleTransitionEnd}
            >
              <SwipeCard project={project} />
              <div
                className="pointer-events-none absolute right-4 top-6 z-10 rounded-lg border-4 border-emerald-500 bg-white/85 px-3 py-1 text-2xl font-extrabold tracking-wide text-emerald-500"
                style={{ transform: 'rotate(14deg)', opacity: likeProgress }}
              >
                LIKE
              </div>
              <div
                className="pointer-events-none absolute left-4 top-6 z-10 rounded-lg border-4 border-rose-500 bg-white/85 px-3 py-1 text-2xl font-extrabold tracking-wide text-rose-500"
                style={{ transform: 'rotate(-14deg)', opacity: skipProgress }}
              >
                SKIP
              </div>
            </div>
          )
        }

        const scale = offset === 1 ? 0.95 : 0.9
        const yOffset = offset === 1 ? '8px' : '16px'
        const zIndex = offset === 1 ? 10 : 0
        return (
          <div
            key={key}
            className="pointer-events-none absolute inset-0"
            style={{ transform: `scale(${scale}) translateY(${yOffset})`, opacity: offset === 2 ? 0.6 : 0.85, zIndex }}
          >
            <SwipeCard project={project} />
          </div>
        )
      })}
    </div>
  )
}