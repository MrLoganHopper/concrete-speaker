# CACTUS JACK CONCRETE SPEAKER MK.1, interactive React draw entry

A faithful, responsive recreation of the 1024 × 572 Figma mockup, with a genuine 3D scene powered by React Three Fiber.

## Run locally

Requirements: Node.js 20.19+ (or 22+).

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually http://localhost:5173.

To produce a static, deployable website:

```bash
npm run build
npm run preview
```

Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages with appropriate base, etc.).

## Replace the placeholder with your GLB

**Fastest, no code editing:** Click `LOAD .GLB` below the 3D speaker. Select your `.glb` from your computer. It is loaded locally in that browser tab; your model is not uploaded to a server. The app makes a temporary blob URL, which disappears when you refresh.

**Persistent production setup:**

1. Copy your model to `public/models/my-speaker.glb`.
2. Open `src/config.js` and change `export const MODEL_URL = null` to:

   ```js
   export const MODEL_URL = '/models/my-speaker.glb'
   ```

3. Run `npm run dev` or `npm run build`.

The GLB loader automatically centers and scales almost any model to fit the scene. If your model needs a different orientation or visual size, adjust `MODEL_ADJUSTMENTS` in `src/config.js`.

### Motion behavior

Defined in `src/components/BootCanvas.jsx`:

- Continuous **slow rotation around Y**, with a small oscillating component.
- Oscillating **X/Y rotation tilt** and **Z position** give a floating appearance.
- Cursor position contributes small, smooth **X/Y tilt** changes, as if pulled toward the cursor.
- **Pointer drag** adds responsive 3D world rotation (X and Y). When the pointer releases, drag rotation damps back to zero over roughly two seconds.
- **X and Y positions remain exactly fixed** throughout. Only the Z position oscillates.
- Use **RESET VIEW** or press **R** when the viewport is focused to reset interaction angles.
- Honors `prefers-reduced-motion` by disabling autonomous motion and reducing cursor tilt.

To change the feel, edit the `useFrame` function's `0.085` Y spin speed, `0.15` Z bob amplitude, `0.18 / 0.2` cursor tilt, and `1.35` release damping values.

### Other interactive features

- Speaker size selector (units 7 through 13), from the technical table or selected size in the summary.
- Quantity +/- buttons (limited to the example low-stock count of 4).
- Subtotal, shipping, taxes, duties, and total recalculate instantly. Initial values match the mockup ($576.14).
- Taxes info tooltip, animated CTA, utility menus, toast feedback, and a simulated draw-entry flow with email-form validation.

**Important:** This is a frontend demo. It does **not** charge cards, place holds, submit real entries, verify stock, store emails, or process transactions. Replace the demo entry form with your backend and integrate a payment processor if building a live release.

## Structure

```text
src/
  App.jsx                     Product page, pricing and UI interactions
  styles.css                  Responsive layout and hover/transition design
  config.js                   Editable product data and MODEL_URL
  components/
    BootCanvas.jsx            React Three Fiber scene, GLB loading, pointer motion
    ProceduralBoot.jsx Built-in extruded 3D speaker placeholder
public/models/              Put your production GLB here
```

Stack: React 19, React Three Fiber 9, Drei 10, Three.js, Vite 7. Fonts are loaded from Google Fonts when online, with system fallbacks.
