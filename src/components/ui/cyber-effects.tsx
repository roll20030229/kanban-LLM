'use client'

import { useEffect, useRef, useState, ReactNode, useCallback } from 'react'
import { styled, keyframes, css } from '@/lib/stitches.config'

const auroraFlow = keyframes({
  '0%, 100%': {
    transform: 'translateX(-15%) translateY(2%) skewX(-4deg) scale(1)',
    opacity: '0.6',
  },
  '20%': {
    transform: 'translateX(3%) translateY(-4%) skewX(2deg) scale(1.04)',
    opacity: '0.82',
  },
  '40%': {
    transform: 'translateX(12%) translateY(2%) skewX(-3deg) scale(1.02)',
    opacity: '0.55',
  },
  '60%': {
    transform: 'translateX(5%) translateY(-3%) skewX(3deg) scale(1.06)',
    opacity: '0.72',
  },
  '80%': {
    transform: 'translateX(-8%) translateY(4%) skewX(-2deg) scale(1.01)',
    opacity: '0.48',
  },
})

const auroraFlowSlow = keyframes({
  '0%, 100%': {
    transform: 'translateX(10%) translateY(-3%) skewX(3deg) scale(1.03)',
    opacity: '0.45',
  },
  '33%': {
    transform: 'translateX(-8%) translateY(4%) skewX(-4deg) scale(1.06)',
    opacity: '0.65',
  },
  '66%': {
    transform: 'translateX(12%) translateY(-2%) skewX(2deg) scale(1.01)',
    opacity: '0.50',
  },
})

const dotPulse = keyframes({
  '0%, 100%': { opacity: '0.25' },
  '50%': { opacity: '0.5' },
})

const StitchBackground = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
  overflow: 'hidden',
  background: '#000000',
  pointerEvents: 'none',
})

const AuroraLayer = styled('div', {
  position: 'absolute',
  bottom: '-20%',
  left: '-20%',
  right: '-20%',
  height: '70%',
  pointerEvents: 'none',
  filter: 'blur(60px)',
})

const AuroraBlob = styled('div', {
  position: 'absolute',
  borderRadius: '50%',
  willChange: 'transform, opacity',
  variants: {
    color: {
      blue: {
        background: 'radial-gradient(ellipse, rgba(79, 143, 255, 0.7) 0%, rgba(79, 143, 255, 0.3) 30%, transparent 70%)',
      },
      purple: {
        background: 'radial-gradient(ellipse, rgba(168, 85, 247, 0.65) 0%, rgba(168, 85, 247, 0.28) 30%, transparent 70%)',
      },
      cyan: {
        background: 'radial-gradient(ellipse, rgba(34, 211, 238, 0.55) 0%, rgba(34, 211, 238, 0.22) 30%, transparent 70%)',
      },
      pink: {
        background: 'radial-gradient(ellipse, rgba(236, 72, 153, 0.45) 0%, rgba(236, 72, 153, 0.18) 30%, transparent 70%)',
      },
    },
    speed: {
      slow: {},
      slower: {},
    },
  },
  compoundVariants: [
    { speed: 'slow', css: { animation: `${auroraFlow} 18s ease-in-out infinite` } },
    { speed: 'slower', css: { animation: `${auroraFlowSlow} 25s ease-in-out infinite` } },
  ],
})

const DotGridCanvas = styled('canvas', {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
})

const VignetteOverlay = styled('div', {
  position: 'absolute',
  inset: 0,
  background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.5) 100%)',
  pointerEvents: 'none',
})

interface DotParticle {
  x: number
  y: number
  baseX: number
  baseY: number
  vx: number
  vy: number
  size: number
  baseOpacity: number
  flowOffsetX: number
  flowOffsetY: number
  flowSpeedX: number
  flowSpeedY: number
  flowAmplitudeX: number
  flowAmplitudeY: number
  flowPhaseX: number
  flowPhaseY: number
}

function useDotField(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const particlesRef = useRef<DotParticle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animFrameRef = useRef<number>(0)
  const initialized = useRef(false)

  const initParticles = useCallback((width: number, height: number) => {
    const gap = 28
    const cols = Math.ceil(width / gap) + 2
    const rows = Math.ceil(height / gap) + 2
    const particles: DotParticle[] = []

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * gap + ((j % 2) * (gap / 2))
        const y = j * gap
        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
          size: Math.random() * 1.2 + 0.6,
          baseOpacity: Math.random() * 0.25 + 0.15,
          flowOffsetX: 0,
          flowOffsetY: 0,
          flowSpeedX: 0.0003 + Math.random() * 0.0004,
          flowSpeedY: 0.00025 + Math.random() * 0.00035,
          flowAmplitudeX: 4 + Math.random() * 6,
          flowAmplitudeY: 3 + Math.random() * 5,
          flowPhaseX: Math.random() * Math.PI * 2,
          flowPhaseY: Math.random() * Math.PI * 2,
        })
      }
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    if (!initialized.current) {
      initParticles(width, height)
      initialized.current = true
    }

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      initParticles(width, height)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const INFLUENCE_RADIUS = 160
    const REPULSION_STRENGTH = 4.5
    const RETURN_SPEED = 0.06
    const FRICTION = 0.88

    let startTime = performance.now()

    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const elapsed = performance.now() - startTime

      for (const p of particlesRef.current) {
        p.flowOffsetX = Math.sin(elapsed * p.flowSpeedX + p.flowPhaseX) * p.flowAmplitudeX
        p.flowOffsetY = Math.cos(elapsed * p.flowSpeedY + p.flowPhaseY) * p.flowAmplitudeY + Math.sin(elapsed * p.flowSpeedX * 0.7 + p.flowPhaseY) * (p.flowAmplitudeY * 0.5)

        const targetX = p.baseX + p.flowOffsetX
        const targetY = p.baseY + p.flowOffsetY

        const dx = p.x - mx
        const dy = p.y - my
        const distSq = dx * dx + dy * dy
        const dist = Math.sqrt(distSq)

        if (dist < INFLUENCE_RADIUS && dist > 0.1) {
          const force = (1 - dist / INFLUENCE_RADIUS)
          const power = force * force * REPULSION_STRENGTH
          const nx = dx / dist
          const ny = dy / dist
          p.vx += nx * power
          p.vy += ny * power
        }

        const returnDx = targetX - p.x
        const returnDy = targetY - p.y
        p.vx += returnDx * RETURN_SPEED
        p.vy += returnDy * RETURN_SPEED

        p.vx *= FRICTION
        p.vy *= FRICTION

        p.x += p.vx
        p.y += p.vy

        const displacement = Math.sqrt(
          (p.x - targetX) ** 2 + (p.y - targetY) ** 2
        )
        const dispFactor = Math.min(displacement / 40, 1)
        const opacity = p.baseOpacity + dispFactor * 0.35

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fill()
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [initParticles])

  return null
}

interface StitchBackgroundProps {
  children?: ReactNode
}

export function CyberBackgroundEffect({ children }: StitchBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useDotField(canvasRef)

  return (
    <>
      <StitchBackground>
        <AuroraLayer>
          <AuroraBlob
            color="blue"
            speed="slow"
            css={{
              width: '700px',
              height: '500px',
              left: '5%',
              bottom: '10%',
              animationDelay: '0s',
            }}
          />
          <AuroraBlob
            color="purple"
            speed="slower"
            css={{
              width: '600px',
              height: '450px',
              left: '35%',
              bottom: '5%',
              animationDelay: '-6s',
            }}
          />
          <AuroraBlob
            color="cyan"
            speed="slow"
            css={{
              width: '550px',
              height: '400px',
              left: '60%',
              bottom: '15%',
              animationDelay: '-12s',
            }}
          />
          <AuroraBlob
            color="pink"
            speed="slower"
            css={{
              width: '480px',
              height: '350px',
              left: '75%',
              bottom: '0%',
              animationDelay: '-18s',
            }}
          />
        </AuroraLayer>

        <DotGridCanvas ref={canvasRef} />

        <VignetteOverlay />
      </StitchBackground>
      {children}
    </>
  )
}

export function NeonBorder({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function GlitchEffect({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function CyberLine() {
  return null
}

export function CyberStatusIndicator({ status }: { status: string }) {
  return null
}

export function HoverShine({ children }: { children: ReactNode }) {
  return <>{children}</>
}
