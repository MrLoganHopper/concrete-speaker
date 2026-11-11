/**
 * Set MODEL_URL to '/models/my-speaker.glb' after copying your own GLB into public/models.
 * Leave it `null` to show the built-in procedural 3D speaker. Alternatively, use the
 * LOAD .GLB control in the page to preview a GLB from your laptop at runtime.
 */
export const MODEL_URL = '/models/model.glb'

export const PRODUCT = {
  name: 'Concrete Speaker',
  sku: 'CJS-011-CON',
  stock: 4,
  lot: '04/2026',
  material: 'CONCRETE / ABS',
  origin: 'BROOKLYN, NY',
  unitPrice: 350,
  baseShipping: 121.14,
  additionalShipping: 24,
  taxRate: 0.21,
  dutyRate: 0.09,
}

/** Per-model corrections: keep the default automatic normalization unless needed. */
export const MODEL_ADJUSTMENTS = {
  rotation: [0, 0, 0],
  scaleMultiplier: 1,
}
