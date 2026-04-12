'use client'

import { useEffect, useRef, ReactNode, useCallback } from 'react'
import { styled } from '@/lib/stitches.config'

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

const AuroraCanvas = styled('canvas', {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
})

const DotGridCanvas = styled('canvas', {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
})

interface AuroraLayer {
  baseY: number
  amplitude: number
  frequency: number
  speed: number
  phase: number
  blur: number
  opacity: number
  colors: Array<{ stop: number; r: number; g: number; b: number; alpha: number }>
}

interface DotParticle {
  x: number
  y: number
  baseX: number
  baseY: number
  vx: number
  vy: number
  size: number
  baseOpacity: number
}

function createAuroraLayers(height: number): AuroraLayer[] {
  const auroraHeight = height * 0.35
  
  return [
    {
      baseY: height - auroraHeight * 0.3,
      amplitude: 60,
      frequency: 0.002,
      speed: 0.0008,
      phase: 0,
      blur: 50,
      opacity: 0.5,
      colors: [
        { stop: 0, r: 120, g: 80, b: 200, alpha: 0.5 },
        { stop: 0.3, r: 100, g: 100, b: 220, alpha: 0.45 },
        { stop: 0.6, r: 80, g: 150, b: 220, alpha: 0.4 },
        { stop: 0.8, r: 60, g: 200, b: 220, alpha: 0.35 },
        { stop: 1, r: 100, g: 220, b: 220, alpha: 0.3 },
      ],
    },
    {
      baseY: height - auroraHeight * 0.5,
      amplitude: 80,
      frequency: 0.0015,
      speed: 0.0006,
      phase: 2,
      blur: 60,
      opacity: 0.45,
      colors: [
        { stop: 0, r: 100, g: 60, b: 180, alpha: 0.45 },
        { stop: 0.3, r: 80, g: 100, b: 200, alpha: 0.4 },
        { stop: 0.6, r: 60, g: 150, b: 200, alpha: 0.35 },
        { stop: 0.8, r: 50, g: 180, b: 200, alpha: 0.3 },
        { stop: 1, r: 80, g: 200, b: 200, alpha: 0.25 },
      ],
    },
    {
      baseY: height - auroraHeight * 0.7,
      amplitude: 100,
      frequency: 0.0012,
      speed: 0.0005,
      phase: 4,
      blur: 70,
      opacity: 0.4,
      colors: [
        { stop: 0, r: 80, g: 50, b: 160, alpha: 0.4 },
        { stop: 0.3, r: 70, g: 90, b: 180, alpha: 0.35 },
        { stop: 0.6, r: 50, g: 140, b: 180, alpha: 0.3 },
        { stop: 0.8, r: 40, g: 170, b: 180, alpha: 0.25 },
        { stop: 1, r: 60, g: 180, b: 180, alpha: 0.2 },
      ],
    },
    {
      baseY: height - auroraHeight * 0.9,
      amplitude: 120,
      frequency: 0.001,
      speed: 0.0004,
      phase: 6,
      blur: 80,
      opacity: 0.35,
      colors: [
        { stop: 0, r: 70, g: 40, b: 140, alpha: 0.35 },
        { stop: 0.3, r: 60, g: 80, b: 160, alpha: 0.3 },
        { stop: 0.6, r: 40, g: 130, b: 160, alpha: 0.25 },
        { stop: 0.8, r: 30, g: 160, b: 160, alpha: 0.2 },
        { stop: 1, r: 50, g: 170, b: 160, alpha: 0.15 },
      ],
    },
  ]
}

function createDotGrid(width: number, height: number): DotParticle[] {
  const gap = 20
  const cols = Math.ceil(width / gap) + 2
  const rows = Math.ceil(height / gap) + 2
  const particles: DotParticle[] = []

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * gap
      const y = j * gap
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: 0,
        vy: 0,
        size: 1.2,
        baseOpacity: 0.2,
      })
    }
  }
  return particles
}

function useAuroraEffect(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  dotCanvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const layersRef = useRef<AuroraLayer[]>([])
  const particlesRef = useRef<DotParticle[]>([])
  const animFrameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const initialized = useRef(false)

  const init = useCallback((width: number, height: number) => {
    layersRef.current = createAuroraLayers(height)
    particlesRef.current = createDotGrid(width, height)
    startTimeRef.current = performance.now()
    initialized.current = true
  }, [])

  const calculateWaveY = useCallback(
    (x: number, layer: AuroraLayer, time: number): number => {
      const wave1 = Math.sin(x * layer.frequency + time * layer.speed + layer.phase) * layer.amplitude
      const wave2 = Math.sin(x * layer.frequency * 1.5 + time * layer.speed * 0.8 + layer.phase * 1.5) * (layer.amplitude * 0.5)
      const wave3 = Math.sin(x * layer.frequency * 2.5 + time * layer.speed * 1.2 + layer.phase * 2) * (layer.amplitude * 0.3)
      
      const noise = Math.sin(x * 0.01 + time * 0.0003) * 20 + Math.cos(x * 0.005 - time * 0.0002) * 15
      
      return layer.baseY + wave1 + wave2 + wave3 + noise
    },
    []
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const dotCanvas = dotCanvasRef.current
    
    if (!canvas || !dotCanvas) return

    let width = window.innerWidth
    let height = window.innerHeight

    const setupCanvas = (c: HTMLCanvasElement) => {
      c.width = width * window.devicePixelRatio
      c.height = height * window.devicePixelRatio
      c.style.width = `${width}px`
      c.style.height = `${height}px`
    }

    setupCanvas(canvas)
    setupCanvas(dotCanvas)

    const auroraCtx = canvas.getContext('2d')
    const dotCtx = dotCanvas.getContext('2d')
    
    if (!auroraCtx || !dotCtx) return

    auroraCtx.scale(window.devicePixelRatio, window.devicePixelRatio)
    dotCtx.scale(window.devicePixelRatio, window.devicePixelRatio)

    if (!initialized.current) {
      init(width, height)
    }

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      setupCanvas(canvas)
      setupCanvas(dotCanvas)
      auroraCtx.setTransform(1, 0, 0, 1, 0, 0)
      auroraCtx.scale(window.devicePixelRatio, window.devicePixelRatio)
      dotCtx.setTransform(1, 0, 0, 1, 0, 0)
      dotCtx.scale(window.devicePixelRatio, window.devicePixelRatio)
      init(width, height)
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

    const CYCLE_DURATION = 10000
    const FADE_IN_DURATION = 1500
    const FADE_OUT_START = 8000
    const FADE_OUT_DURATION = 2000
    const BASE_OPACITY = 0.8

    function animate() {
      if (!auroraCtx || !dotCtx) return

      const currentTime = performance.now() - startTimeRef.current
      const cycleTime = currentTime % CYCLE_DURATION
      
      let globalOpacity = BASE_OPACITY
      
      if (cycleTime < FADE_IN_DURATION) {
        const fadeInProgress = cycleTime / FADE_IN_DURATION
        globalOpacity = BASE_OPACITY * fadeInProgress
      } else if (cycleTime > FADE_OUT_START) {
        const fadeOutProgress = (cycleTime - FADE_OUT_START) / FADE_OUT_DURATION
        globalOpacity = BASE_OPACITY * (1 - Math.min(fadeOutProgress, 1))
      }

      auroraCtx.clearRect(0, 0, width, height)
      auroraCtx.globalCompositeOperation = 'screen'

      layersRef.current.forEach((layer) => {
        const gradient = auroraCtx.createLinearGradient(0, layer.baseY - layer.amplitude * 2, 0, layer.baseY + layer.amplitude * 2)
        
        layer.colors.forEach((color) => {
          gradient.addColorStop(color.stop, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.alpha * globalOpacity})`)
        })

        auroraCtx.save()
        auroraCtx.filter = `blur(${layer.blur}px)`
        auroraCtx.fillStyle = gradient

        auroraCtx.beginPath()
        auroraCtx.moveTo(0, height)

        const step = 10
        for (let x = 0; x <= width; x += step) {
          const y = calculateWaveY(x, layer, currentTime)
          auroraCtx.lineTo(x, y)
        }

        auroraCtx.lineTo(width, height)
        auroraCtx.closePath()
        auroraCtx.fill()
        auroraCtx.restore()
      })

      auroraCtx.globalCompositeOperation = 'source-over'

      dotCtx.clearRect(0, 0, width, height)
      
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const INFLUENCE_RADIUS = 80
      const REPULSION_STRENGTH = 0.8
      const RETURN_SPEED = 0.008
      const FRICTION = 0.94

      for (const p of particlesRef.current) {
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

        const returnDx = p.baseX - p.x
        const returnDy = p.baseY - p.y
        p.vx += returnDx * RETURN_SPEED
        p.vy += returnDy * RETURN_SPEED

        p.vx *= FRICTION
        p.vy *= FRICTION

        p.x += p.vx
        p.y += p.vy

        dotCtx.beginPath()
        dotCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        dotCtx.fillStyle = `rgba(255, 255, 255, ${p.baseOpacity * globalOpacity})`
        dotCtx.fill()
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
  }, [init, calculateWaveY])

  return null
}

interface StitchBackgroundProps {
  children?: ReactNode
}

export function CyberBackgroundEffect({ children }: StitchBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotCanvasRef = useRef<HTMLCanvasElement>(null)

  useAuroraEffect(canvasRef, dotCanvasRef)

  return (
    <>
      <StitchBackground>
        <AuroraCanvas ref={canvasRef} />
        <DotGridCanvas ref={dotCanvasRef} />
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
