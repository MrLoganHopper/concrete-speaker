import { useEffect, useMemo, useRef, useState } from 'react'
import BootCanvas from './components/BootCanvas.jsx'
import { MODEL_URL, PRODUCT } from './config.js'

const SIZES = [7, 8, 9, 10, 11, 12, 13]
const money = value => `$${value.toFixed(2)}`

function IconMenu({ onClick, label, active }) {
  return <button type="button" className={`utility-menu ${active ? 'is-active' : ''}`} aria-label={label} aria-expanded={active} onClick={onClick}><span>!!!</span></button>
}

function SpecRow({ firstLabel, firstValue, secondLabel, secondValue, onFirstClick }) {
  return (
    <div className="spec-row">
      <div className="spec-cell"><span className="spec-label">{firstLabel}</span>{onFirstClick ? <button type="button" className="spec-value spec-editable" onClick={onFirstClick} aria-label={`Change ${firstLabel.toLowerCase()}`}>{firstValue} <span className="spec-edit-icon">↗</span></button> : <span className="spec-value">{firstValue}</span>}</div>
      <div className="spec-cell"><span className="spec-label">{secondLabel}</span><span className="spec-value">{secondValue}</span></div>
    </div>
  )
}

function Popover({ title, children, onClose }) {
  return (
    <div className="utility-popover" role="dialog" aria-label={title}>
      <div className="popover-heading"><span>{title}</span><button type="button" className="close-button" onClick={onClose} aria-label="Close">×</button></div>
      {children}
    </div>
  )
}

function DrawModal({ total, qty, size, onClose, onSubmit }) {
  const [email, setEmail] = useState('')
  const [accepted, setAccepted] = useState(false)
  const field = useRef(null)
  useEffect(() => {
    field.current?.focus()
    const onKeyDown = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return <div className="modal-backdrop" onPointerDown={e => { if (e.currentTarget === e.target) onClose() }}>
    <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="draw-title">
      <div className="modal-number">FORM 001 / ENTRY REQUEST <button type="button" className="close-button" aria-label="Close dialog" onClick={onClose}>×</button></div>
      <h2 id="draw-title">ENTER<br />THE DRAW<span className="accent">*</span></h2>
      <p className="modal-intro">Confirm your selection to preview the drawing entry flow. This is a frontend demo. No entry is submitted and no payment is collected.</p>
      <div className="modal-summary"><span>CACTUS JACK CONCRETE SPEAKER / SIZE {size}</span><span>QTY {String(qty).padStart(2, '0')}</span><strong>{money(total)}</strong></div>
      <form onSubmit={e => { e.preventDefault(); if (!accepted) return; onSubmit(email) }}>
        <label className="input-label" htmlFor="email">EMAIL ADDRESS / FOR DEMO ONLY</label>
        <input ref={field} id="email" type="email" required placeholder="YOUR@EMAIL.COM" value={email} onChange={e => setEmail(e.target.value)} />
        <label className="checkbox-line"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} /><span>I understand this is an interactive design demo with no actual charge or reservation.</span></label>
        <button type="submit" className="modal-submit" disabled={!accepted}>SIMULATE ENTRY <span>↗</span></button>
      </form>
      <p className="modal-footnote">* NO CHARGE. NO PERSONAL DATA IS TRANSMITTED.</p>
    </div>
  </div>
}

function SuccessModal({ onClose }) {
  return <div className="modal-backdrop" onPointerDown={e => { if (e.currentTarget === e.target) onClose() }}>
    <div className="modal-card success-card" role="dialog" aria-modal="true" aria-label="Demo entry completed">
      <div className="success-sparkles" aria-hidden="true">{Array.from({length: 12},(_,i)=><i key={i} style={{'--i':i}} />)}</div>
      <div className="modal-number">SYSTEM / TEST CONFIRMATION <button type="button" className="close-button" onClick={onClose} aria-label="Close">×</button></div>
      <div className="success-mark">✓</div>
      <h2>ENTRY<br />SIMULATED.</h2>
      <p className="modal-intro">Your interaction worked. This is a design preview, so no real draw entry was placed, no payment was made, and no email was sent.</p>
      <button type="button" className="modal-submit" onClick={onClose}>BACK TO OBJECT <span>↗</span></button>
    </div>
  </div>
}

export default function App() {
  const [size, setSize] = useState(11)
  const [qty, setQty] = useState(1)
  const [sizeOpen, setSizeOpen] = useState(null)
  const [activeMenu, setActiveMenu] = useState(null)
  const [dialog, setDialog] = useState(null)
  const [uploadedModel, setUploadedModel] = useState(null)
  const [modelName, setModelName] = useState(null)
  const [resetToken, setResetToken] = useState(0)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const totals = useMemo(() => {
    const subtotal = qty * PRODUCT.unitPrice
    const shipping = PRODUCT.baseShipping + (qty - 1) * PRODUCT.additionalShipping
    const taxes = subtotal * PRODUCT.taxRate
    const duties = subtotal * PRODUCT.dutyRate
    return { subtotal, shipping, taxes, duties, total: subtotal + shipping + taxes + duties }
  }, [qty])

  const modelUrl = uploadedModel || MODEL_URL
  useEffect(() => () => { if (uploadedModel) URL.revokeObjectURL(uploadedModel) }, [uploadedModel])
  useEffect(() => () => clearTimeout(toastTimer.current), [])
  useEffect(() => {
    const closeOnEscape = e => { if (e.key === 'Escape') { setActiveMenu(null); setSizeOpen(null) } }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [])

  function notify(message) {
    clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), 2700)
  }
  function loadGlb(file) {
    setUploadedModel(URL.createObjectURL(file))
    setModelName(file.name)
    setResetToken(n => n + 1)
    notify('3D ASSET LOADED / ' + file.name.toUpperCase())
  }
  function resetModel() {
    setResetToken(n => n + 1)
    notify('VIEW RECENTERED')
  }
  function restorePlaceholder() {
    setUploadedModel(null)
    setModelName(null)
    setResetToken(n => n + 1)
    notify('PROCEDURAL SPEAKER RESTORED')
  }
  function changeQty(amount) {
    setQty(q => Math.max(1, Math.min(PRODUCT.stock, q + amount)))
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-corner">
          <IconMenu label="Open object information" active={activeMenu==='object'} onClick={() => setActiveMenu(activeMenu === 'object' ? null : 'object')} />
        </div>
        <div className="header-title">DRAW ENTRY FORM</div>
        <div className="header-corner header-corner-right">
          <IconMenu label="Open session information" active={activeMenu==='session'} onClick={() => setActiveMenu(activeMenu === 'session' ? null : 'session')} />
        </div>
      </header>

      <main className="page-grid">
        <section className="media-section" aria-label="3D object preview">
          <div className="media-meta">
            <div>01 - CACTUS JACK SPEAKER SIZE {size}</div>
            <div className="photo-info">PHOTO / STUDIO<br />NATURAL LIGHT</div>
          </div>
          <div className="media-border-frame">
            <BootCanvas modelUrl={modelUrl} resetToken={resetToken} onUpload={loadGlb} onReset={resetModel} />
            <div className="media-bottom"><span>LOW STOCK: {String(PRODUCT.stock).padStart(2,'0')} / 2026 <b className="stock-pulse" /></span><span>Page 1 of 1</span></div>
          </div>
        </section>

        <section className="details-section" aria-labelledby="product-name">
          <div className="details-main">
            <div className="eyebrow mobile-only">01 / OBJECT DETAILS</div>
            <h1 id="product-name">CONCRETE<br />SPEAKER</h1>
            <p className="product-description">A heavy, deliberate audio object, cast from a single textured concrete enclosure. Tuned for a dense, room-filling response. The weight and tactile finish make one-handed placement feel distinct.</p>
            <div className="spec-table" aria-label="Technical specifications">
              <SpecRow firstLabel="SKU" firstValue={PRODUCT.sku} secondLabel="LOT" secondValue={PRODUCT.lot} />
              <SpecRow firstLabel="SIZE" firstValue={String(size).padStart(2,'0')} secondLabel="DIM" secondValue="CUSTOM" onFirstClick={() => setSizeOpen(sizeOpen === 'spec' ? null : 'spec')} />
              <SpecRow firstLabel="MATERIAL" firstValue={PRODUCT.material} secondLabel="PORTS" secondValue="USB-C / AUX" />
              <SpecRow firstLabel="ORIGIN" firstValue={PRODUCT.origin} secondLabel="CONTROLS" secondValue="TOP-MOUNTED" />
            </div>
            {sizeOpen === 'spec' && <div className="size-pop" role="dialog" aria-label="Select speaker size">
              <div className="size-title"><span>SELECT SIZE / UNIT</span><button type="button" onClick={() => setSizeOpen(null)} aria-label="Close size picker">×</button></div>
              <div className="size-options">{SIZES.map(s=><button key={s} type="button" className={s===size?'selected':''} onClick={()=>{setSize(s);setSizeOpen(null);notify(`SIZE ${s} SELECTED`)}}>{s}</button>)}</div>
            </div>}
            <div className="total-block" aria-live="polite">TOTAL: {money(totals.total)} <span className="accent total-star">*</span></div>
          </div>
          <p className="disclaimer"><span className="accent">*</span> NOTE: ALL DRAWING ENTRIES WILL RESULT IN A PENDING HOLD. THIS IS NOT A CHARGE AND WILL BE REVERSED FOR THOSE WHO DO NOT WIN. <span className="demo-suffix">DEMO ONLY.</span></p>
        </section>

        <aside className="summary-section" aria-label="Draw entry summary">
          <h2 className="section-heading">DRAW ENTRY SUMMARY</h2>
          <div className="entry-summary">
            <div>Cactus Jack Concrete Speaker SIZE {size}</div>
            <button type="button" className="summary-size" onClick={() => setSizeOpen(sizeOpen === 'summary' ? null : 'summary')} aria-label="Change size" aria-expanded={sizeOpen==='summary'}>SIZE {size} <span>↗</span></button>
            {sizeOpen==='summary' && <div className="summary-size-pop" role="dialog" aria-label="Select speaker size">
              <div className="size-title"><span>SELECT SIZE / UNIT</span><button type="button" onClick={()=>setSizeOpen(null)} aria-label="Close size picker">×</button></div>
              <div className="size-options">{SIZES.map(s=><button key={s} type="button" className={s===size?'selected':''} onClick={()=>{setSize(s);setSizeOpen(null);notify(`SIZE ${s} SELECTED`)}}>{s}</button>)}</div>
            </div>}
            <div className="summary-qty">
              <span>QUANTITY:</span>
              <div className="qty-picker">
                <button type="button" onClick={() => changeQty(-1)} disabled={qty===1} aria-label="Decrease quantity">−</button>
                <output aria-live="polite">{String(qty).padStart(2,'0')}</output>
                <button type="button" onClick={() => changeQty(1)} disabled={qty===PRODUCT.stock} aria-label="Increase quantity">+</button>
              </div>
            </div>
            <div className="item-price">{money(totals.subtotal)} <span className="accent">*</span></div>
          </div>
          <div className="cost-summary">
            <div><span>SUBTOTAL</span><span>{money(totals.subtotal)}</span></div>
            <div><span>SHIPPING</span><span>{money(totals.shipping)}</span></div>
            <div className="tax-row"><span>TAXES <button type="button" className="tax-help" aria-label="Explain estimated taxes" aria-expanded={activeMenu==='tax'} onClick={() => setActiveMenu(activeMenu==='tax'?null:'tax')}>?</button></span><span>{money(totals.taxes)}</span></div>
            <div><span>DUTIES</span><span>{money(totals.duties)}</span></div>
            {activeMenu==='tax' && <div className="tax-tooltip" role="status">Estimate based on a sample 21% tax rate. Actual checkout would calculate tax based on your location.</div>}
          </div>
          <div className="summary-underline" />
          <button type="button" className="enter-button" onClick={() => setDialog('entry')}>
            <span><small>READY TO PROCEED?</small>ENTER THE DRAW</span>
            <span className="enter-arrow">↗</span>
          </button>
          <div className="entry-notice"><span className="live-dot" /> INTERACTIVE PREVIEW / NO CHARGE</div>
        </aside>
      </main>

      {activeMenu==='object' && <Popover title="OBJECT / 001" onClose={() => setActiveMenu(null)}>
        <div className="popover-big">CJS<br/>MK.1</div>
        <p>TYPE / CONCRETE AUDIO OBJECT<br/>FINISH / RAW CAST CONCRETE<br/>MODEL / {modelName ? 'CUSTOM GLB' : MODEL_URL ? 'LOCAL GLB' : 'PROCEDURAL'}</p>
        <button className="popover-action" type="button" onClick={()=>{setActiveMenu(null);resetModel()}}>RESET VIEW ↗</button>
      </Popover>}
      {activeMenu==='session' && <Popover title="SYSTEM / READY" onClose={() => setActiveMenu(null)}>
        <div className="status-readout"><span className="status-ring" /> VIEWPORT LIVE</div>
        <p>ENGINE / REACT THREE FIBER<br/>DRAG / ENABLED<br/>RETURN SPRING / ENABLED<br/>AUTO ROTATE / ENABLED<br/>ASSET / {modelName || (MODEL_URL ? 'YOUR GLB' : 'PLACEHOLDER 3D')}</p>
        <button className="popover-action" type="button" onClick={()=>{restorePlaceholder();setActiveMenu(null)}}>RESTORE PLACEHOLDER ↗</button>
      </Popover>}

      {toast && <div className="toast" role="status"><span className="accent">*</span> {toast}</div>}
      {dialog==='entry' && <DrawModal total={totals.total} qty={qty} size={size} onClose={()=>setDialog(null)} onSubmit={()=>{setDialog('success');notify('ENTRY SIMULATION COMPLETE')}} />}
      {dialog==='success' && <SuccessModal onClose={()=>setDialog(null)} />}
    </div>
  )
}
