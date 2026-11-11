import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'
import { MODEL_ADJUSTMENTS } from '../config.js'
import { ProceduralBoot } from './ProceduralBoot.jsx'

class ModelErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error) { console.error('GLB failed to load; using procedural preview:', error) }
  render() { return this.state.error ? <ProceduralBoot /> : this.props.children }
}

function LoadedModel({ url }) {
  const { scene } = useGLTF(url)
  const result = useMemo(() => {
    const clone = cloneSkeleton(scene)
    clone.updateMatrixWorld(true)
    const bounds = new THREE.Box3().setFromObject(clone)
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    const largest = Math.max(size.x, size.y, size.z, 0.00001)
    const normalizedScale = (2.85 / largest) * MODEL_ADJUSTMENTS.scaleMultiplier
    return { clone, center, normalizedScale }
  }, [scene])

  return (
    <group rotation={MODEL_ADJUSTMENTS.rotation} scale={result.normalizedScale}>
      <primitive object={result.clone} position={[-result.center.x, -result.center.y, -result.center.z]} />
    </group>
  )
}

/**
 * Coordinates are deliberately decoupled:
 * - world.rotation.x/y: cursor pull + drag + a tiny idle tilt
 * - model.rotation.y: continuous slow idle spin around the vertical axis
 * - model.position.z: soft in/out oscillation
 * - world/model.position.x/y: ALWAYS 0 (no lateral drift)
 * Drag angles spring back over ~2s after release, while idle y rotation continues.
 */
function MotionRig({ pointer, modelUrl, resetToken, reducedMotion }) {
  const world = useRef(null)
  const model = useRef(null)
  const dragX = useRef(0)
  const dragY = useRef(0)
  const hoverX = useRef(0)
  const hoverY = useRef(0)

  useEffect(() => {
    dragX.current = 0
    dragY.current = 0
    hoverX.current = 0
    hoverY.current = 0
    pointer.current.dragX = 0
    pointer.current.dragY = 0
    pointer.current.x = 0
    pointer.current.y = 0
  }, [resetToken, pointer])

  useFrame((state, delta) => {
    if (!world.current || !model.current) return
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    if (!pointer.current.dragging) {
      pointer.current.dragX = THREE.MathUtils.damp(pointer.current.dragX, 0, 1.35, dt)
      pointer.current.dragY = THREE.MathUtils.damp(pointer.current.dragY, 0, 1.35, dt)
    }
    const pullMultiplier = reducedMotion ? 0.4 : 1
    hoverX.current = THREE.MathUtils.damp(hoverX.current, -pointer.current.y * 0.18 * pullMultiplier, 3.8, dt)
    hoverY.current = THREE.MathUtils.damp(hoverY.current, pointer.current.x * 0.2 * pullMultiplier, 3.8, dt)
    dragX.current = THREE.MathUtils.damp(dragX.current, pointer.current.dragX, pointer.current.dragging ? 10 : 2.3, dt)
    dragY.current = THREE.MathUtils.damp(dragY.current, pointer.current.dragY, pointer.current.dragging ? 10 : 2.3, dt)

    const idleX = reducedMotion ? 0 : Math.sin(t * 0.62) * 0.058
    const idleY = reducedMotion ? 0 : Math.cos(t * 0.48) * 0.072
    world.current.rotation.x = THREE.MathUtils.damp(world.current.rotation.x, idleX + hoverX.current + dragX.current, 5.8, dt)
    world.current.rotation.y = THREE.MathUtils.damp(world.current.rotation.y, idleY + hoverY.current + dragY.current, 5.8, dt)

    if (!reducedMotion) {
      model.current.rotation.y = t * 0.085 + Math.sin(t * 0.5) * 0.042
      model.current.position.z = Math.sin(t * 0.88) * 0.15
    } else {
      model.current.rotation.y = THREE.MathUtils.damp(model.current.rotation.y, 0, 3.5, dt)
      model.current.position.z = THREE.MathUtils.damp(model.current.position.z, 0, 3.5, dt)
    }
    // Intentionally no x/y position updates. The object stays pinned at the origin.
  })

  return (
    <group ref={world}>
      <group ref={model}>
        {modelUrl ? (
          <ModelErrorBoundary key={modelUrl}>
            <Suspense fallback={<ProceduralBoot />}>
              <LoadedModel url={modelUrl} />
            </Suspense>
          </ModelErrorBoundary>
        ) : <ProceduralBoot />}
      </group>
    </group>
  )
}

export default function BootCanvas({ modelUrl, resetToken, onUpload, onReset }) {
  const region = useRef(null)
  const uploadInput = useRef(null)
  const pointer = useRef({ x: 0, y: 0, dragging: false, dragX: 0, dragY: 0, lastX: 0, lastY: 0 })
  const [isDragging, setDragging] = useState(false)
  const [isHovering, setHovering] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    pointer.current.dragging = false
    setDragging(false)
  }, [resetToken])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  function move(event) {
    if (!region.current) return
    const rect = region.current.getBoundingClientRect()
    const px = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const py = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    pointer.current.x = THREE.MathUtils.clamp(px, -1, 1)
    pointer.current.y = THREE.MathUtils.clamp(py, -1, 1)
    if (pointer.current.dragging) {
      const dx = event.clientX - pointer.current.lastX
      const dy = event.clientY - pointer.current.lastY
      pointer.current.dragY = THREE.MathUtils.clamp(pointer.current.dragY + dx * 0.009, -1.65, 1.65)
      pointer.current.dragX = THREE.MathUtils.clamp(pointer.current.dragX + dy * 0.009, -1.05, 1.05)
      pointer.current.lastX = event.clientX
      pointer.current.lastY = event.clientY
    }
  }
  function down(event) {
    if (event.button !== 0) return
    event.preventDefault()
    pointer.current.dragging = true
    pointer.current.lastX = event.clientX
    pointer.current.lastY = event.clientY
    region.current?.setPointerCapture?.(event.pointerId)
    setDragging(true)
  }
  function up(event) {
    pointer.current.dragging = false
    if (region.current?.hasPointerCapture?.(event.pointerId)) region.current.releasePointerCapture(event.pointerId)
    setDragging(false)
  }
  function leave() {
    if (!pointer.current.dragging) { pointer.current.x = 0; pointer.current.y = 0 }
    setHovering(false)
  }
  function pick(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.glb')) {
      window.alert('Please choose a .glb file. You can also put one into public/models.')
      event.target.value = ''
      return
    }
    onUpload(file)
    event.target.value = ''
  }

  return (
    <div className="viewer-wrap">
      <div
        ref={region}
        role="img"
        aria-label="Interactive floating Cactus Jack concrete speaker. Move your mouse to tilt, drag to rotate. Release to ease back."
        tabIndex={0}
        className={`viewer-interaction ${isDragging ? 'dragging' : ''}`}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={leave}
        onPointerMove={move}
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={event => { if (event.key.toLowerCase() === 'r') onReset() }}
      >
        <Canvas
          className="viewer-canvas"
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 6.7], fov: 32, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent', pointerEvents: 'none' }}
        >
          <ambientLight intensity={1.6} />
          <hemisphereLight args={['#ffffff', '#1a0b0d', 2.3]} />
          <directionalLight position={[-3, 6, 7]} color="#fff5f0" intensity={3.2} />
          <directionalLight position={[4, 2, -3]} color="#1c0794" intensity={2.2} />
          <spotLight position={[3, -3, 6]} color="#b5b0fb" intensity={1.9} angle={0.8} penumbra={1} />
          <MotionRig pointer={pointer} modelUrl={modelUrl} resetToken={resetToken} reducedMotion={reducedMotion} />
        </Canvas>
        <span className={`viewer-crosshair c1 ${isHovering ? 'visible' : ''}`} />
        <span className={`viewer-crosshair c2 ${isHovering ? 'visible' : ''}`} />
        <div className={`viewer-cursor-note ${isHovering ? 'active' : ''}`}>
          {isDragging ? 'ROTATING OBJECT...' : 'MOVE TO TILT  /  DRAG TO ROTATE'}
        </div>
      </div>
      <div className="viewer-controls">
        
      </div>
      <input className="visually-hidden" type="file" ref={uploadInput} onChange={pick} accept=".glb,model/gltf-binary" />
    </div>
  )
}
