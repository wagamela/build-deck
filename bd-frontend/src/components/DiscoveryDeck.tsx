import { useEffect, useRef, useState } from 'react'
import type {
  PointerEvent as ReactPointerEvent,
  TransitionEvent as ReactTransitionEvent,
} from 'react'
import type { Project } from '../data/projects'
import CardBack from './CardBack'
import SwipeCard from './SwipeCard'

const SWIPE_THRESHOLD = 100
const TILT_PER_PX = 0.08
const MAX_TILT = 18
const FLYOUT_MS = 450
const BACK_COLORS = ['#17171d', '#141419', '#191922', '#131318', '#16161c']

export interface DeckControls {
  like: () => void
  skip: () => void
  jumpTo: (index: number) => void
}

interface DragState {
  pointerId: number
  startX: number
  startY: number
}

interface DiscoveryDeckProps {
  deck: Project[]
  controlsRef: { current: DeckControls | null }
  onDecision?: (direction: 'left' | 'right') => void
  onActiveChange?: (index: number) => void
}

export default function DiscoveryDeck({
  deck,
  controlsRef,
  onDecision,
  onActiveChange,
}: DiscoveryDeckProps) {
  const [counter, setCounter] = useState(0)
  const [dx, setDx] = useState(0)
  const [dy, setDy] = useState(0)
  const [leaving, setLeaving] = useState<'left' | 'right' | null>(null)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<DragState | null>(null)
  const leavingRef = useRef<'left' | 'right' | null>(null)
  const draggedRef = useRef(false)
  const onDecisionRef = useRef(onDecision)
  const onActiveChangeRef = useRef(onActiveChange)

  useEffect(() => {
    leavingRef.current = leaving
  }, [leaving])

  useEffect(() => {
    onDecisionRef.current = onDecision
  }, [onDecision])

  useEffect(() => {
    onActiveChangeRef.current = onActiveChange
  }, [onActiveChange])

  const total = deck.length
  const topIndex = counter % deck.length
  const position = topIndex + 1
  const stack = [0, 1, 2].map((offset) => ({
    project: deck[(topIndex + offset) % deck.length],
    key: counter + offset,
    offset,
  }))

  const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, dx * TILT_PER_PX))
  const likeProgress = Math.min(Math.max(dx / SWIPE_THRESHOLD, 0), 1)
  const skipProgress = Math.min(Math.max(-dx / SWIPE_THRESHOLD, 0), 1)

  useEffect(() => {
    onActiveChangeRef.current?.(topIndex)
  }, [counter, topIndex])

  function advance() {
    setCounter((value) => value + 1)
    setDx(0)
    setDy(0)
    setLeaving(null)
    draggedRef.current = false
  }

  function startLeave(direction: 'left' | 'right') {
    if (leaving) return
    setLeaving(direction)
    onDecisionRef.current?.(direction)
    window.setTimeout(() => {
      if (leavingRef.current) advance()
    }, FLYOUT_MS)
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (leaving) return
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    }
    draggedRef.current = true
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
      startLeave(dx > 0 ? 'right' : 'left')
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

  useEffect(() => {
    controlsRef.current = {
      like: () => startLeave('right'),
      skip: () => startLeave('left'),
      jumpTo: (index) => {
        if (leaving) return
        setCounter(index)
        setDx(0)
        setDy(0)
        setLeaving(null)
        draggedRef.current = false
      },
    }
  })

  const transform =
    leaving === 'right'
      ? 'translateX(170%) rotate(24deg)'
      : leaving === 'left'
        ? 'translateX(-170%) rotate(-24deg)'
        : `translate(${dx}px, ${dy}px) rotate(${tilt}deg)`

  const topTransitionClass = leaving
    ? 'transition-transform duration-300 ease-out'
    : dragging
      ? ''
      : 'transition-transform duration-300 ease-spring'

  return (
    <div className="relative h-[min(64vh,38rem)] w-[min(92vw,28.5rem)] select-none">
      {stack.map(({ project, key, offset }) => {
        if (offset === 0) {
          const arriveClass = leaving || draggedRef.current ? '' : 'animate-card-arrive'
          return (
            <div
              key={key}
              className={`absolute inset-0 z-20 touch-none will-change-transform ${arriveClass} ${topTransitionClass}`}
              style={{ transform }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onTransitionEnd={handleTransitionEnd}
            >
              <SwipeCard project={project} position={position} total={total} />
              <div
                className="pointer-events-none absolute right-4 top-5 z-10 rounded-md border-2 border-success bg-background/90 px-3 py-1 text-sm font-bold uppercase tracking-[0.2em] text-success"
                style={{ transform: 'rotate(12deg)', opacity: likeProgress }}
              >
                Like
              </div>
              <div
                className="pointer-events-none absolute left-4 top-5 z-10 rounded-md border-2 border-error bg-background/90 px-3 py-1 text-sm font-bold uppercase tracking-[0.2em] text-error"
                style={{ transform: 'rotate(-12deg)', opacity: skipProgress }}
              >
                Skip
              </div>
            </div>
          )
        }

        const scale = offset === 1 ? 0.95 : 0.9
        const yOffset = offset === 1 ? '10px' : '22px'
        const rotation = offset === 1 ? -2.5 : 2.5
        const zIndex = offset === 1 ? 10 : 0
        return (
          <div
            key={key}
            className="pointer-events-none absolute inset-0"
            style={{
              transform: `translateY(${yOffset}) rotate(${rotation}deg) scale(${scale})`,
              zIndex,
            }}
          >
            <CardBack color={BACK_COLORS[(counter + offset) % BACK_COLORS.length]} />
          </div>
        )
      })}
    </div>
  )
}