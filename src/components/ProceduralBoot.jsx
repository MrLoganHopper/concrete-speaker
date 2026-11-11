import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Purely procedural fallback asset, no GLB needed. Its XY silhouette is extruded along Z,
 * so it is a true 3D mesh with visible thickness, shading, and surfaces while rotating.
 */
export function ProceduralBoot() {
  const geometries = useMemo(() => {
    const side = new THREE.Shape()
    side.moveTo(-0.78, -1.30)
    side.bezierCurveTo(-0.86, -1.26, -0.82, -1.05, -0.77, -0.83)
    side.lineTo(-0.69, 1.09)
    side.quadraticCurveTo(-0.67, 1.27, -0.53, 1.28)
    side.lineTo(0.06, 1.28)
    side.quadraticCurveTo(0.21, 1.27, 0.20, 1.06)
    side.lineTo(0.19, -0.34)
    side.quadraticCurveTo(0.20, -0.50, 0.50, -0.61)
    side.bezierCurveTo(0.95, -0.73, 1.19, -0.97, 1.20, -1.20)
    side.quadraticCurveTo(1.20, -1.36, 1.01, -1.38)
    side.lineTo(-0.58, -1.38)
    side.quadraticCurveTo(-0.75, -1.38, -0.78, -1.30)

    const upper = new THREE.Shape()
    upper.moveTo(-0.78, 1.13)
    upper.quadraticCurveTo(-0.76, 1.36, -0.56, 1.40)
    upper.quadraticCurveTo(-0.12, 1.47, 0.16, 1.39)
    upper.quadraticCurveTo(0.31, 1.35, 0.29, 1.15)
    upper.quadraticCurveTo(0.27, 1.02, 0.08, 1.00)
    upper.lineTo(-0.56, 1.00)
    upper.quadraticCurveTo(-0.75, 1.02, -0.78, 1.13)

    const mark = new THREE.Shape()
    mark.moveTo(-0.54, 0.92)
    mark.lineTo(-0.39, 0.92)
    mark.lineTo(-0.40, -0.80)
    mark.quadraticCurveTo(-0.36, -0.98, -0.09, -1.15)
    mark.lineTo(0.04, -1.26)
    mark.quadraticCurveTo(-0.36, -1.17, -0.51, -0.95)
    mark.quadraticCurveTo(-0.57, -0.82, -0.56, -0.56)
    mark.closePath()

    const settings = { depth: 0.60, steps: 1, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.10, bevelSegments: 5, curveSegments: 12 }
    const body = new THREE.ExtrudeGeometry(side, settings)
    body.translate(0, 0, -0.3)
    body.computeVertexNormals()
    const cuff = new THREE.ExtrudeGeometry(upper, { depth: 0.66, steps: 1, bevelEnabled: true, bevelSize: 0.075, bevelThickness: 0.085, bevelSegments: 6, curveSegments: 14 })
    cuff.translate(0, 0, -0.33)
    cuff.computeVertexNormals()
    const stripe = new THREE.ExtrudeGeometry(mark, { depth: 0.012, steps: 1, bevelEnabled: true, bevelSize: 0.014, bevelThickness: 0.009, bevelSegments: 2, curveSegments: 10 })
    stripe.translate(0, 0, 0.405)
    return { body, cuff, stripe }
  }, [])

  useEffect(() => () => Object.values(geometries).forEach(g => g.dispose()), [geometries])

  return (
    <></>
  )
}
