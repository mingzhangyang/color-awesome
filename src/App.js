import { Navigation } from './components/Navigation.js'
import { MobileNavigation } from './components/MobileNavigation.js'
import { ColorConverter } from './components/ColorConverter.js'
import { ImageColorPicker } from './components/ImageColorPicker.js'
import { ColorCollection } from './components/ColorCollection.js'
import { KeyboardShortcuts } from './utils/KeyboardShortcuts.js'
import { UIEnhancements } from './utils/UIEnhancements.js'
import { PerformanceOptimizer } from './utils/PerformanceOptimizer.js'
import { AdComponent, refreshAdsOnNavigation } from './components/AdComponent.js'

const VALID_VIEWS = ['converter', 'image-picker', 'collection']

export class App {
  constructor() {
    this.currentView = 'converter'
    this.appElement = document.getElementById('app')
    this.previousView = null
    this.isTransitioning = false
    this.pendingView = null
    this.isDesktopSidebarCollapsed = this.getInitialSidebarState()
    this.navigation = null
    this.mobileNavigation = null
    this.lastLocationSignature = ''

    this.initialConverterState = {}
    this.initialCollectionState = {}
    this.converterLandingPath = '/convert'
    this.converterShareState = {
      hex: '#3b82f6',
      contrast: '#ffffff'
    }
  }

  init() {
    this.applyInitialViewFromLocation()
    this.initializeEnhancements()
    this.render()
    this.setupEventListeners()
    this.updateSeoMetadata(this.currentView)
  }

  parseLocationState(locationObject = window.location) {
    const rawPath = locationObject.pathname || '/'
    const pathname = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '')
    const params = new URLSearchParams(locationObject.search || '')
    const hashView = (locationObject.hash || '').replace(/^#/, '')

    const parsed = {
      view: 'converter',
      converterPath: '/convert',
      converterState: {},
      collectionState: {},
      pathname
    }

    if (pathname === '/image-picker') {
      parsed.view = 'image-picker'
    } else if (pathname === '/collection') {
      parsed.view = 'collection'
    } else if (pathname === '/palette') {
      parsed.view = 'collection'
      parsed.collectionState.sharedPalette = this.parseSharedPaletteFromParams(params)
    } else if (pathname === '/hex-to-rgb') {
      parsed.view = 'converter'
      parsed.converterPath = '/hex-to-rgb'
    } else if (pathname === '/contrast-checker') {
      parsed.view = 'converter'
      parsed.converterPath = '/contrast-checker'
      parsed.converterState.focusSection = 'contrast'
    } else if (pathname === '/convert') {
      parsed.view = 'converter'
      parsed.converterPath = '/convert'
    } else if (pathname === '/') {
      parsed.view = 'converter'
      parsed.converterPath = '/convert'
    }

    const hex = this.normalizeHex(params.get('hex') || params.get('color'))
    const contrast = this.normalizeHex(params.get('compare') || params.get('contrast'))

    if (hex) parsed.converterState.hex = hex
    if (contrast) parsed.converterState.contrast = contrast

    if (VALID_VIEWS.includes(hashView)) {
      parsed.view = hashView
      if (hashView === 'converter') {
        parsed.converterPath = '/convert'
      }
    }

    return parsed
  }

  parseSharedPaletteFromParams(params) {
    const rawColors = params.get('colors')
    if (!rawColors) return null

    const colors = rawColors
      .split(',')
      .map((value) => this.normalizeHex(value))
      .filter(Boolean)

    if (colors.length === 0) return null

    const uniqueColors = [...new Set(colors.map((color) => color.toLowerCase()))]
    const name = (params.get('name') || 'Shared Palette')
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 80)

    return {
      name: name || 'Shared Palette',
      hexes: uniqueColors
    }
  }

  buildLocationSignature(parsed) {
    const sharedPaletteSignature = parsed.collectionState?.sharedPalette
      ? `${parsed.collectionState.sharedPalette.name}:${parsed.collectionState.sharedPalette.hexes.join(',')}`
      : ''

    return [
      parsed.view,
      parsed.converterPath,
      parsed.converterState?.hex || '',
      parsed.converterState?.contrast || '',
      parsed.converterState?.focusSection || '',
      parsed.pathname,
      sharedPaletteSignature
    ].join('|')
  }

  normalizeHex(value) {
    if (!value || typeof value !== 'string') return null

    let hex = value.trim().toLowerCase()
    if (!hex.startsWith('#')) {
      hex = `#${hex}`
    }

    if (/^#[0-9a-f]{3}$/.test(hex)) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    }

    if (!/^#[0-9a-f]{6}$/.test(hex)) return null
    return hex
  }

  initializeEnhancements() {
    // Initialize keyboard shortcuts
    this.keyboardShortcuts = new KeyboardShortcuts(this)

    // Initialize UI enhancements
    this.uiEnhancements = new UIEnhancements()

    // Initialize performance optimizer
    this.performanceOptimizer = new PerformanceOptimizer()

    // Add global accessibility improvements
    this.setupAccessibility()
  }

  setupAccessibility() {
    // Add focus trap for modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabNavigation(e)
      }
    })

    // Add focus indicators
    document.addEventListener('focusin', (e) => {
      if (e.target.matches('button, input, select, textarea, [tabindex]')) {
        e.target.classList.add('focus-ring')
      }
    })

    document.addEventListener('focusout', (e) => {
      e.target.classList.remove('focus-ring')
    })
  }

  handleTabNavigation(e) {
    const modal = document.querySelector('.modal:not(.hidden), [role="dialog"]:not(.hidden)')
    if (modal) {
      const focusableElements = modal.querySelectorAll(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  render() {
    const footerAd = AdComponent.create('footer')

    this.appElement.innerHTML = `
      <div class="app-shell min-h-screen ${this.isDesktopSidebarCollapsed ? 'sidebar-collapsed' : ''}">
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <div class="page-bg-orb orb-1" aria-hidden="true"></div>
        <div class="page-bg-orb orb-2" aria-hidden="true"></div>

        <div class="app-layout">
          <aside class="app-sidebar" aria-label="Workspace navigation">
            <div class="sidebar-top">
              <div class="sidebar-brand">
                <img src="/app-icon.svg" class="brand-mark" alt="" aria-hidden="true" decoding="async" />
                <div class="sidebar-brand-copy">
                  <p class="sidebar-eyebrow">Color Workspace</p>
                  <h1 class="sidebar-title">Color Awesome</h1>
                </div>
              </div>
            </div>

            <p class="sidebar-summary">Fast tools for conversion, sampling, and saved palettes.</p>
            <nav id="navigation" class="sidebar-nav" aria-label="Primary navigation"></nav>
            <div class="sidebar-bottom">
              <button id="sidebar-toggle" class="sidebar-toggle" type="button" aria-label="Collapse sidebar">
                <svg class="sidebar-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M14 7l-5 5 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="sidebar-toggle-text">Collapse</span>
              </button>
            </div>
          </aside>

          <div class="app-content">
            <main class="app-main">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
                <div id="main-content" class="animate-fade-in app-main-panel view-host">
                  <!-- Content will be injected here -->
                </div>
              </div>
            </main>

            <footer class="app-footer">
              ${footerAd.render()}

              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="text-center text-slate-600 space-y-4">
                  <p>&copy; 2026 Orangely. Built for color-focused workflows.</p>
                  <div class="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm">
                    <a href="mailto:contact@orangely.xyz?subject=Color%20Awesome%20-%20Question" class="footer-link">
                      Contact Developer
                    </a>
                    <a href="https://github.com/mingzhangyang/color-awesome/issues" target="_blank" rel="noopener noreferrer" class="footer-link">
                      Report Issues
                    </a>
                    <a href="https://github.com/mingzhangyang/color-awesome" target="_blank" rel="noopener noreferrer" class="footer-link">
                      GitHub Repository
                    </a>
                    <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" class="footer-link">
                      Privacy Policy
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    `

    this.initializeComponents()
  }

  initializeComponents() {
    this.navigation = new Navigation(this.currentView, (view) => this.switchView(view))
    this.navigation.render()

    this.setupLayoutControls()

    this.mobileNavigation = new MobileNavigation(this.currentView, (view) => this.switchView(view))
    this.mobileNavigation.render()

    this.initializeAds()
    this.renderCurrentView()
  }

  initializeAds() {
    setTimeout(() => {
      refreshAdsOnNavigation()
    }, 100)
  }

  renderCurrentView() {
    if (this.isTransitioning) return

    const contentElement = document.getElementById('main-content')
    if (!contentElement) return

    const currentElement = contentElement.firstElementChild

    const newContent = document.createElement('div')
    newContent.className = 'view-content'
    newContent.setAttribute('data-view', this.currentView)

    this.isTransitioning = true

    switch (this.currentView) {
      case 'converter': {
        const converter = new ColorConverter({
          initialHex: this.initialConverterState.hex,
          initialContrast: this.initialConverterState.contrast,
          focusSection: this.initialConverterState.focusSection,
          sharePath: this.converterLandingPath,
          onStateChange: (state) => this.handleConverterStateChange(state)
        })
        converter.render(newContent)
        break
      }
      case 'image-picker': {
        const imagePicker = new ImageColorPicker()
        imagePicker.render(newContent)
        break
      }
      case 'collection': {
        const collection = new ColorCollection({
          sharedPalette: this.initialCollectionState.sharedPalette || null
        })
        collection.render(newContent)
        break
      }
      default:
        newContent.innerHTML = '<div class="text-center">View not found</div>'
    }

    if (!currentElement) {
      contentElement.replaceChildren(newContent)
      if (this.uiEnhancements) {
        this.uiEnhancements.enhanceNewContent(newContent)
      }
      this.finishViewTransition()
      return
    }

    contentElement.replaceChildren(newContent)
    if (this.uiEnhancements) {
      this.uiEnhancements.enhanceNewContent(newContent)
    }
    this.finishViewTransition()
  }

  finishViewTransition() {
    this.isTransitioning = false
    if (this.pendingView && this.pendingView !== this.currentView) {
      const queuedView = this.pendingView
      this.pendingView = null
      this.switchView(queuedView)
      return
    }
    this.pendingView = null
  }

  switchView(view) {
    if (view === this.currentView) return
    if (this.isTransitioning) {
      this.pendingView = view
      return
    }

    if (view === 'converter') {
      this.converterLandingPath = '/convert'
      this.initialConverterState.focusSection = ''
    }

    this.previousView = this.currentView
    this.currentView = view
    this.renderCurrentView()

    if (this.mobileNavigation) {
      this.mobileNavigation.updateActiveView(view)
    }

    if (this.navigation) {
      this.navigation.updateActiveView(view)
    }

    refreshAdsOnNavigation()

    const targetUrl = this.buildUrlForView(view)
    const currentUrl = `${window.location.pathname}${window.location.search}`
    if (targetUrl !== currentUrl) {
      window.history.pushState({ view }, '', targetUrl)
    }

    this.lastLocationSignature = this.buildLocationSignature(this.parseLocationState(window.location))
    this.updateSeoMetadata(view)
  }

  handleConverterStateChange(state) {
    if (!state) return

    this.converterShareState = {
      ...this.converterShareState,
      ...state
    }

    if (state.sharePath) {
      this.converterLandingPath = state.sharePath
    }

    if (this.currentView !== 'converter') return

    const targetUrl = this.buildConverterUrl(this.converterShareState)
    const currentUrl = `${window.location.pathname}${window.location.search}`

    if (targetUrl !== currentUrl) {
      window.history.replaceState({ view: 'converter' }, '', targetUrl)
    }

    this.lastLocationSignature = this.buildLocationSignature(this.parseLocationState(window.location))
    this.updateSeoMetadata('converter')
  }

  buildConverterUrl(state = this.converterShareState) {
    const path = this.converterLandingPath || '/convert'
    const hex = this.normalizeHex(state.hex) || '#3b82f6'
    const contrast = this.normalizeHex(state.contrast) || '#ffffff'
    const params = new URLSearchParams()

    if (hex !== '#3b82f6') {
      params.set('hex', hex)
    }

    if (contrast !== '#ffffff') {
      params.set('compare', contrast)
    }

    const query = params.toString()
    return query ? `${path}?${query}` : path
  }

  buildUrlForView(view) {
    if (view === 'converter') {
      return this.buildConverterUrl(this.converterShareState)
    }

    if (view === 'image-picker') {
      return '/image-picker'
    }

    if (view === 'collection') {
      return '/collection'
    }

    return '/convert'
  }

  setupEventListeners() {
    window.addEventListener('beforeunload', () => {
      console.log('Saving data before page unload...')
    })

    window.addEventListener('popstate', () => {
      const parsed = this.parseLocationState(window.location)
      const signature = this.buildLocationSignature(parsed)
      if (signature === this.lastLocationSignature) return

      this.lastLocationSignature = signature
      this.previousView = this.currentView
      this.currentView = parsed.view
      this.initialConverterState = parsed.converterState
      this.initialCollectionState = parsed.collectionState
      this.converterLandingPath = parsed.converterPath

      if (parsed.converterState.hex || parsed.converterState.contrast) {
        this.converterShareState = {
          ...this.converterShareState,
          ...parsed.converterState
        }
      }

      this.renderCurrentView()
      this.syncNavigationState(parsed.view)
      this.updateSeoMetadata(parsed.view)
    })

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1)
      if (VALID_VIEWS.includes(hash) && hash !== this.currentView) {
        this.switchView(hash)
      }
    })

    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0]
          if (navigation) {
            console.log(`Page load time: ${navigation.loadEventEnd - navigation.loadEventStart}ms`)
          }
        }, 0)
      })
    }

    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error)
      if (this.uiEnhancements) {
        this.uiEnhancements.showToast('An error occurred. Please try again.', 'error')
      }
    })

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason)
      if (this.uiEnhancements) {
        this.uiEnhancements.showToast('An error occurred. Please try again.', 'error')
      }
      e.preventDefault()
    })
  }

  applyInitialViewFromLocation() {
    const parsed = this.parseLocationState(window.location)
    this.currentView = parsed.view
    this.initialConverterState = parsed.converterState
    this.initialCollectionState = parsed.collectionState
    this.converterLandingPath = parsed.converterPath

    if (parsed.converterState.hex || parsed.converterState.contrast) {
      this.converterShareState = {
        ...this.converterShareState,
        ...parsed.converterState
      }
    }

    this.lastLocationSignature = this.buildLocationSignature(parsed)
  }

  syncNavigationState(view) {
    if (this.mobileNavigation) {
      this.mobileNavigation.updateActiveView(view)
    }
    if (this.navigation) {
      this.navigation.updateActiveView(view)
    }
  }

  updateSeoMetadata(view) {
    const baseUrl = 'https://color-awesome.orangely.xyz'
    const currentPath = window.location.pathname === '/' ? '' : window.location.pathname
    const currentSearch = window.location.search || ''

    let target = {
      title: 'Color Awesome – Free Color Converter, Picker & Palette Builder',
      description: 'Convert HEX, RGB, HSL, HSV, CMYK & LAB colors, pick from images, build palettes, and verify WCAG contrast.',
      url: `${baseUrl}${currentPath || '/'}${currentSearch}`
    }

    if (view === 'image-picker') {
      target = {
        title: 'Image Color Picker – Extract Colors from Any Image | Color Awesome',
        description: 'Pick exact pixels and extract dominant palettes from uploaded images with instant HEX/RGB/HSL values.',
        url: `${baseUrl}/image-picker`
      }
    } else if (view === 'collection') {
      if (window.location.pathname === '/palette') {
        target = {
          title: 'Shared Color Palette | Color Awesome',
          description: 'Open and import shared color palettes, then organize and export them in multiple formats.',
          url: `${baseUrl}/palette${currentSearch}`
        }
      } else {
        target = {
          title: 'Color Collection – Save and Export Palettes | Color Awesome',
          description: 'Save, tag, search, and export reusable color palettes for design and development workflows.',
          url: `${baseUrl}/collection`
        }
      }
    } else if (window.location.pathname === '/hex-to-rgb') {
      target = {
        title: 'HEX to RGB Converter – Fast Online Color Conversion | Color Awesome',
        description: 'Convert HEX colors to RGB instantly, copy values, and explore related formats with live preview.',
        url: `${baseUrl}/hex-to-rgb${currentSearch}`
      }
    } else if (window.location.pathname === '/contrast-checker') {
      target = {
        title: 'WCAG Contrast Checker – Accessibility Color Tool | Color Awesome',
        description: 'Check WCAG AA/AAA contrast ratios between two colors and improve accessibility for text and UI.',
        url: `${baseUrl}/contrast-checker${currentSearch}`
      }
    } else if (window.location.pathname === '/convert') {
      target = {
        title: 'Color Converter – HEX, RGB, HSL, HSV, CMYK, LAB | Color Awesome',
        description: 'Convert between HEX, RGB, HSL, HSV, CMYK, and LAB color formats with instant updates.',
        url: `${baseUrl}/convert${currentSearch}`
      }
    }

    document.title = target.title
    this.setCanonicalUrl(target.url)
    this.setMetaByName('description', target.description)
    this.setMetaByProperty('og:title', target.title)
    this.setMetaByProperty('og:description', target.description)
    this.setMetaByProperty('og:url', target.url)
    this.setMetaByName('twitter:title', target.title)
    this.setMetaByName('twitter:description', target.description)
    this.setMetaByName('twitter:url', target.url)
  }

  setCanonicalUrl(url) {
    const canonical = document.head.querySelector('link[rel="canonical"]')
    if (canonical) {
      canonical.setAttribute('href', url)
    }
  }

  setMetaByName(name, content) {
    const meta = document.head.querySelector(`meta[name="${name}"]`)
    if (meta) {
      meta.setAttribute('content', content)
    }
  }

  setMetaByProperty(property, content) {
    const meta = document.head.querySelector(`meta[property="${property}"]`)
    if (meta) {
      meta.setAttribute('content', content)
    }
  }

  getInitialSidebarState() {
    try {
      return localStorage.getItem('colorAwesome_sidebar_collapsed') === '1'
    } catch {
      return false
    }
  }

  setupLayoutControls() {
    const toggleButton = document.getElementById('sidebar-toggle')
    if (!toggleButton) return

    toggleButton.addEventListener('click', () => {
      this.isDesktopSidebarCollapsed = !this.isDesktopSidebarCollapsed
      this.applySidebarState()
      try {
        localStorage.setItem('colorAwesome_sidebar_collapsed', this.isDesktopSidebarCollapsed ? '1' : '0')
      } catch {
        // Ignore storage write failure
      }
    })

    this.applySidebarState()
  }

  applySidebarState() {
    const appShell = this.appElement?.querySelector('.app-shell')
    const toggleButton = document.getElementById('sidebar-toggle')

    if (appShell) {
      appShell.classList.toggle('sidebar-collapsed', this.isDesktopSidebarCollapsed)
    }

    if (toggleButton) {
      toggleButton.setAttribute('aria-pressed', String(this.isDesktopSidebarCollapsed))
      toggleButton.setAttribute('aria-label', this.isDesktopSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar')
      const toggleText = toggleButton.querySelector('.sidebar-toggle-text')
      if (toggleText) {
        toggleText.textContent = this.isDesktopSidebarCollapsed ? 'Expand' : 'Collapse'
      }
    }
  }

  cleanup() {
    if (this.performanceOptimizer) {
      this.performanceOptimizer.cleanup()
    }

    if (this.performanceOptimizer) {
      const insights = this.performanceOptimizer.getPerformanceInsights()
      console.log('Performance Insights:', insights)
    }
  }

  getAppHealth() {
    const insights = this.performanceOptimizer?.getPerformanceInsights() || {}

    return {
      currentView: this.currentView,
      isTransitioning: this.isTransitioning,
      performanceInsights: insights,
      timestamp: new Date().toISOString()
    }
  }
}
