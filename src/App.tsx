import { useState, useEffect, useRef } from 'react'
import './App.css'

type Category = 'all' | 'mobile' | 'pc' | 'admin' | 'other'

interface ImageItem {
  id: number
  src: string
  label: string
  category: Exclude<Category, 'all'>
}

const IMAGES: ImageItem[] = [
  { id: 1,  src: '/example/1.移动端.jpg',                    label: '首页',          category: 'mobile' },
  { id: 2,  src: '/example/2.移动端行情.jpg',                label: '行情',          category: 'mobile' },
  { id: 3,  src: '/example/3.移动端交易.jpg',                label: '交易',          category: 'mobile' },
  { id: 4,  src: '/example/4.移动端交易简易k线.jpg',         label: '交易简易K线',   category: 'mobile' },
  { id: 5,  src: '/example/5.移动端现货详情.jpg',            label: '现货详情',      category: 'mobile' },
  { id: 6,  src: '/example/6.移动端选择交易对弹框.jpg',      label: '选择交易对',    category: 'mobile' },
  { id: 7,  src: '/example/7.移动端合约.jpg',                label: '合约',          category: 'mobile' },
  { id: 8,  src: '/example/8.移动端合约简易k线.jpg',         label: '合约K线',       category: 'mobile' },
  { id: 9,  src: '/example/9.移动端合约详情.jpg',            label: '合约详情',      category: 'mobile' },
  { id: 10, src: '/example/10.移动端合约选择交易对弹框.jpg', label: '合约选交易对',  category: 'mobile' },
  { id: 11, src: '/example/11.移动端资产.jpg',               label: '资产',          category: 'mobile' },
  { id: 12, src: '/example/12.移动端资产现货.jpg',           label: '资产现货',      category: 'mobile' },
  { id: 13, src: '/example/13.移动端资产合约.jpg',           label: '资产合约',      category: 'mobile' },
  { id: 14, src: '/example/14.移动端web3首页.jpg',           label: 'Web3 首页',     category: 'mobile' },
  { id: 15, src: '/example/15.移动端web3兑换.jpg',           label: 'Web3 兑换',     category: 'mobile' },
  { id: 16, src: '/example/16.移动端web3合约.jpg',           label: 'Web3 合约',     category: 'mobile' },
  { id: 17, src: '/example/17.移动端web3的Dapps.jpg',        label: 'Web3 DApps',    category: 'mobile' },
  { id: 18, src: '/example/18.移动端web3的Dapp浏览器.jpg',   label: 'Web3 DApp浏览器', category: 'mobile' },
  { id: 19, src: '/example/19.pc-首页.png',                  label: '首页',          category: 'pc' },
  { id: 20, src: '/example/20.pc-行情页.png',                label: '行情',          category: 'pc' },
  { id: 21, src: '/example/21.pc-现货.png',                  label: '现货',          category: 'pc' },
  { id: 22, src: '/example/22.pc-现货深度图.png',            label: '现货深度图',    category: 'pc' },
  { id: 23, src: '/example/23.pc-合约.png',                  label: '合约',          category: 'pc' },
  { id: 24, src: '/example/24.pc-现货账户.png',              label: '现货账户',      category: 'pc' },
  { id: 25, src: '/example/25.pc-合约账户.png',              label: '合约账户',      category: 'pc' },
  { id: 26, src: '/example/26.pc-下载页.png',                label: '下载页',        category: 'pc' },
  { id: 27, src: '/example/27.api接口文档.png',              label: 'API 文档',      category: 'other' },
  { id: 28, src: '/example/28.后台仪表盘.png',               label: '仪表盘',        category: 'admin' },
  { id: 29, src: '/example/29.后台用户列表.png',             label: '用户列表',      category: 'admin' },
]

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all',    label: '全部' },
  { key: 'mobile', label: '移动端' },
  { key: 'pc',     label: 'PC 端' },
  { key: 'admin',  label: '后台' },
  { key: 'other',  label: '其他' },
]

function countFor(cat: Category) {
  if (cat === 'all') return IMAGES.length
  return IMAGES.filter(i => i.category === cat).length
}

const BADGE_LABEL: Record<Exclude<Category, 'all'>, string> = {
  mobile: '移动',
  pc: 'PC',
  admin: '后台',
  other: '其他',
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [imgScale, setImgScale] = useState(1)
  const [imgTranslate, setImgTranslate] = useState({ x: 0, y: 0 })
  const [isGestureActive, setIsGestureActive] = useState(false)
  const [showLightboxHint, setShowLightboxHint] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null)
  const panRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null)
  const mousePanRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number; hasMoved: boolean } | null>(null)
  const suppressImageClickRef = useRef(false)

  const filtered = activeCategory === 'all'
    ? IMAGES
    : IMAGES.filter(img => img.category === activeCategory)

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return
    const len = filtered.length
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      setLightboxIndex(null)
      if (e.key === 'ArrowLeft')   setLightboxIndex(i => i !== null ? (i - 1 + len) % len : null)
      if (e.key === 'ArrowRight')  setLightboxIndex(i => i !== null ? (i + 1) % len : null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, filtered.length])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mousePanRef.current === null) return
      const deltaX = e.clientX - mousePanRef.current.startX
      const deltaY = e.clientY - mousePanRef.current.startY
      if (!mousePanRef.current.hasMoved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
        mousePanRef.current.hasMoved = true
      }
      setImgTranslate({
        x: mousePanRef.current.baseX + deltaX,
        y: mousePanRef.current.baseY + deltaY,
      })
    }

    const handleMouseUp = () => {
      if (mousePanRef.current === null) return
      suppressImageClickRef.current = mousePanRef.current.hasMoved
      mousePanRef.current = null
      setIsGestureActive(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Reset zoom and position when switching images
  useEffect(() => {
    setImgScale(1)
    setImgTranslate({ x: 0, y: 0 })
    setIsGestureActive(false)
    mousePanRef.current = null
    suppressImageClickRef.current = false
  }, [lightboxIndex])

  useEffect(() => {
    if (lightboxIndex === null) {
      setShowLightboxHint(false)
      return
    }

    const storageKey = 'exchange-gallery-lightbox-hint-seen'
    let shouldShow = false

    try {
      shouldShow = !window.localStorage.getItem(storageKey)
      if (shouldShow) window.localStorage.setItem(storageKey, '1')
    } catch {
      shouldShow = true
    }

    if (!shouldShow) return

    setShowLightboxHint(true)
    const timer = window.setTimeout(() => setShowLightboxHint(false), 2600)
    return () => window.clearTimeout(timer)
  }, [lightboxIndex])

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation()
    const len = filtered.length
    setLightboxIndex(i => i !== null ? (i - 1 + len) % len : null)
  }
  const next = (e: React.MouseEvent) => {
    e.stopPropagation()
    const len = filtered.length
    setLightboxIndex(i => i !== null ? (i + 1) % len : null)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      setIsGestureActive(true)
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current = { startDist: Math.hypot(dx, dy), startScale: imgScale }
      panRef.current = null
      touchStartX.current = null
    } else if (imgScale > 1) {
      e.preventDefault()
      setIsGestureActive(true)
      panRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, baseX: imgTranslate.x, baseY: imgTranslate.y }
      touchStartX.current = null
    } else {
      touchStartX.current = e.touches[0].clientX
    }
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const next = Math.min(4, Math.max(1, pinchRef.current.startScale * (dist / pinchRef.current.startDist)))
      setImgScale(next)
      if (next <= 1) setImgTranslate({ x: 0, y: 0 })
    } else if (e.touches.length === 1 && panRef.current) {
      e.preventDefault()
      setImgTranslate({
        x: panRef.current.baseX + (e.touches[0].clientX - panRef.current.startX),
        y: panRef.current.baseY + (e.touches[0].clientY - panRef.current.startY),
      })
    }
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pinchRef.current !== null) {
      pinchRef.current = null
      if (e.touches.length === 0) setIsGestureActive(false)
      return
    }
    if (panRef.current !== null) {
      panRef.current = null
      if (e.touches.length === 0) setIsGestureActive(false)
      return
    }
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    touchStartX.current = null
    const len = filtered.length
    if (Math.abs(diff) > 50) {
      setLightboxIndex(i => i !== null
        ? diff > 0 ? (i + 1) % len : (i - 1 + len) % len
        : null
      )
    }
  }

  const setZoom = (nextScale: number) => {
    const clamped = Math.min(4, Math.max(1, nextScale))
    setImgScale(clamped)
    setShowLightboxHint(false)
    if (clamped <= 1) setImgTranslate({ x: 0, y: 0 })
  }

  const handleWheelZoom = (e: React.WheelEvent<HTMLImageElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setZoom(imgScale + (e.deltaY < 0 ? 0.2 : -0.2))
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation()
    if (suppressImageClickRef.current) {
      suppressImageClickRef.current = false
      return
    }
    if (!window.matchMedia('(pointer: fine)').matches) return
    setZoom(imgScale > 1 ? 1 : 2.75)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (imgScale <= 1) return
    e.preventDefault()
    e.stopPropagation()
    setIsGestureActive(true)
    mousePanRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: imgTranslate.x,
      baseY: imgTranslate.y,
      hasMoved: false,
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-mark">⬡</span>
          <h1 className="header-title">界面展示</h1>
        </div>
      </header>

      <nav className="tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={'tab-btn' + (activeCategory === cat.key ? ' tab-btn--active' : '')}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
            <span className="tab-count">{countFor(cat.key)}</span>
          </button>
        ))}
      </nav>

      <main className="gallery">
        {filtered.map((img, index) => (
          <button
            key={img.id}
            className="gallery-item"
            style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
            onClick={() => setLightboxIndex(index)}
            aria-label={img.label}
          >
            <img src={img.src} alt={img.label} loading="lazy" />
            <span className="gallery-overlay" aria-hidden="true" />
            <span className="gallery-zoom" aria-hidden="true" />
            <span className={`gallery-badge gallery-badge--${img.category}`}>{BADGE_LABEL[img.category]}</span>
            <span className="gallery-label">{img.label}</span>
          </button>
        ))}
      </main>

      {lightboxIndex !== null && (
        <div
          className="lightbox"
          onClick={() => setLightboxIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button className="lb-close" onClick={() => setLightboxIndex(null)} aria-label="关闭">✕</button>
          <button className="lb-nav lb-prev" onClick={prev} aria-label="上一张">‹</button>

          <div className="lb-content" onClick={e => e.stopPropagation()}>
            <img
              className={imgScale > 1
                ? `lb-image lb-image--zoomed${isGestureActive ? ' lb-image--dragging' : ''}`
                : 'lb-image'}
              src={filtered[lightboxIndex].src}
              alt={filtered[lightboxIndex].label}
              draggable={false}
              onClick={handleImageClick}
              onMouseDown={handleMouseDown}
              onWheel={handleWheelZoom}
              style={{
                transform: `translate(${imgTranslate.x}px, ${imgTranslate.y}px) scale(${imgScale})`,
                transformOrigin: 'center',
                transition: isGestureActive ? 'none' : 'transform 0.22s ease',
              }}
            />
            {showLightboxHint && (
              <div className="lb-hint" aria-live="polite">
                双指缩放，左右滑动切换
              </div>
            )}
            <div className="lb-footer">
              <span className="lb-caption">{filtered[lightboxIndex].label}</span>
              <span className="lb-counter">{lightboxIndex + 1} / {filtered.length}</span>
            </div>
          </div>

          <button className="lb-nav lb-next" onClick={next} aria-label="下一张">›</button>
        </div>
      )}
    </div>
  )
}

