'use client'

import { useEffect, useRef, useState, ReactNode, useCallback } from 'react'
import { styled, keyframes, css } from '@/lib/stitches.config'

const curtainSway1 = keyframes({
  '0%, 100%': {
    transform: 'skewX(-3deg) translateX(-2%) scaleY(1)',
    opacity: '0.80',
  },
  '25%': {
    transform: 'skewX(2deg) translateX(1%) scaleY(1.02)',
    opacity: '0.92',
  },
  '50%': {
    transform: 'skewX(-1deg) translateX(3%) scaleY(0.98)',
    opacity: '0.72',
  },
  '75%': {
    transform: 'skewX(3deg) translateX(-1%) scaleY(1.01)',
    opacity: '0.88',
  },
})

const curtainSway2 = keyframes({
  '0%, 100%': {
    transform: 'skewX(2deg) translateX(1%) scaleY(1.01)',
    opacity: '0.70',
  },
  '35%': {
    transform: 'skewX(-3deg) translateX(-3%) scaleY(0.97)',
    opacity: '0.85',
  },
  '70%': {
    transform: 'skewX(1deg) translateX(2%) scaleY(1.03)',
    opacity: '0.65',
  },
})

const curtainSway3 = keyframes({
  '0%, 100%': {
    transform: 'skewX(-2deg) translateX(2%) scaleY(1)',
    opacity: '0.62',
  },
  '50%': {
    transform: 'skewX(4deg) translateX(-2%) scaleY(1.04)',
    opacity: '0.82',
  },
})

const auroraBreathe = keyframes({
  '0%, 100%': { opacity: '0.65', filter: 'blur(50px) brightness(1)' },
  '30%': { opacity: '0.88', filter: 'blur(45px) brightness(1.15)' },
  '50%': { opacity: '1', filter: 'blur(40px) brightness(1.25)' },
  '70%': { opacity: '0.82', filter: 'blur(46px) brightness(1.08)' },
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
  bottom: '0',
  left: '-15%',
  right: '-15%',
  height: '75%',
  pointerEvents: 'none',
  animation: `${auroraBreathe} 16s ease-in-out infinite`,
  willChange: 'opacity, filter',
})

const AuroraCurtain = styled('div', {
  position: 'absolute',
  bottom: '0',
  willChange: 'transform, opacity',
  variants: {
    glow: {
      blueLeft: {
        background: 'linear-gradient(to top, rgba(30, 60, 180, 0.92) 0%, rgba(50, 80, 200, 0.75) 15%, rgba(80, 60, 180, 0.55) 35%, rgba(100, 50, 170, 0.30) 55%, rgba(80, 40, 140, 0.12) 75%, transparent 95%)',
      },
      purpleCenter: {
        background: 'linear-gradient(to top, rgba(120, 50, 200, 0.88) 0%, rgba(150, 60, 210, 0.72) 15%, rgba(180, 70, 200, 0.55) 30%, rgba(200, 80, 190, 0.35) 50%, rgba(170, 60, 170, 0.15) 72%, transparent 92%)',
      },
      pinkPeak: {
        background: 'linear-gradient(to top, rgba(200, 60, 180, 0.85) 0%, rgba(230, 80, 170, 0.78) 12%, rgba(250, 100, 160, 0.60) 28%, rgba(240, 120, 180, 0.38) 48%, rgba(200, 100, 180, 0.15) 68%, transparent 90%)',
      },
      magentaCyan: {
        background: 'linear-gradient(to top, rgba(180, 50, 200, 0.80) 0%, rgba(210, 80, 190, 0.65) 12%, rgba(220, 120, 200, 0.48) 25%, rgba(160, 160, 220, 0.42) 40%, rgba(80, 200, 230, 0.55) 55%, rgba(40, 190, 220, 0.30) 72%, transparent 92%)',
      },
      cyanBright: {
        background: 'linear-gradient(to top, rgba(40, 200, 240, 0.90) 0%, rgba(50, 210, 245, 0.78) 12%, rgba(60, 220, 240, 0.58) 28%, rgba(50, 200, 230, 0.35) 48%, rgba(40, 170, 210, 0.15) 70%, transparent 92%)',
      },
      cyanRight: {
        background: 'linear-gradient(to top, rgba(30, 180, 230, 0.82) 0%, rgba(40, 190, 235, 0.65) 15%, rgba(50, 180, 220, 0.45) 32%, rgba(60, 150, 200, 0.25) 52%, rgba(50, 120, 180, 0.10) 72%, transparent 90%)',
      },
      blueRight: {
        background: 'linear-gradient(to top, rgba(40, 80, 200, 0.70) 0%, rgba(50, 100, 210, 0.55) 18%, rgba(60, 90, 190, 0.35) 38%, rgba(50, 70, 160, 0.15) 60%, transparent 88%)',
      },
      deepBase: {
        background: 'linear-gradient(to top, rgba(20, 20, 80, 0.90) 0%, rgba(30, 30, 100, 0.60) 20%, rgba(40, 25, 110, 0.30) 45%, transparent 80%)',
      },
    },
    sway: {
      s1: {},
      s2: {},
      s3: {},
    },
  },
  compoundVariants: [
    { sway: 's1', css: { animation: `${curtainSway1} 28s ease-in-out infinite` } },
    { sway: 's2', css: { animation: `${curtainSway2} 35s ease-in-out infinite` } },
    { sway: 's3', css: { animation: `${curtainSway3} 42s ease-in-out infinite` } },
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
          <AuroraCurtain
            glow="deepBase"
            sway="s3"
            css={{
              width: '130%',
              height: '100%',
              left: '-15%',
              animationDelay: '0s',
            }}
          />
          <AuroraCurtain
            glow="blueLeft"
            sway="s1"
            css={{
              width: '28%',
              height: '95%',
              left: '-5%',
              animationDelay: '-3s',
            }}
          />
          <AuroraCurtain
            glow="purpleCenter"
            sway="s2"
            css={{
              width: '25%',
              height: '90%',
              left: '18%',
              animationDelay: '-10s',
            }}
          />
          <AuroraCurtain
            glow="pinkPeak"
            sway="s1"
            css={{
              width: '22%',
              height: '85%',
              left: '38%',
              animationDelay: '-18s',
            }}
          />
          <AuroraCurtain
            glow="magentaCyan"
            sway="s3"
            css={{
              width: '26%',
              height: '92%',
              left: '52%',
              animationDelay: '-25s',
            }}
          />
          <AuroraCurtain
            glow="cyanBright"
            sway="s2"
            css={{
              width: '24%',
              height: '88%',
              left: '68%',
              animationDelay: '-8s',
            }}
          />
          <AuroraCurtain
            glow="cyanRight"
            sway="s1"
            css={{
              width: '20%',
              height: '82%',
              left: '82%',
              animationDelay: '-15s',
            }}
          />
          <AuroraCurtain
            glow="blueRight"
            sway="s3"
            css={{
              width: '18%',
              height: '78%',
              left: '92%',
              animationDelay: '-30s',
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
