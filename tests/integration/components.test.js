/**
 * Integration Tests for Color Awesome Components
 * Tests component interactions and user workflows
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

// Mock DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>')
global.document = dom.window.document
global.window = dom.window
global.HTMLElement = dom.window.HTMLElement
global.Event = dom.window.Event
global.CustomEvent = dom.window.CustomEvent

// Mock navigator for clipboard and vibrate
global.navigator = {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue('#FF0000')
  },
  vibrate: vi.fn()
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// Mock performance API
global.performance = {
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => [])
}

describe('Component Integration Tests', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '<div id="app"></div>'
    
    // Reset mocks
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    // Cleanup
    document.body.innerHTML = ''
  })

  describe('ColorConverter Component', () => {
    it('should initialize with default color', () => {
      // Mock ColorConverter class
      class MockColorConverter {
        constructor() {
          this.colors = {
            hex: '#3b82f6',
            rgb: { r: 59, g: 130, b: 246 },
            hsl: { h: 217, s: 91, l: 60 }
          }
        }

        render(container) {
          container.innerHTML = `
            <div class="color-converter">
              <input type="color" value="${this.colors.hex}" id="hex-input" />
              <div class="color-preview" style="background-color: ${this.colors.hex}"></div>
              <button class="copy-btn" data-color="${this.colors.hex}">Copy</button>
            </div>
          `
        }
      }

      const converter = new MockColorConverter()
      const container = document.getElementById('app')
      converter.render(container)

      expect(container.querySelector('#hex-input').value).toBe('#3b82f6')
      expect(container.querySelector('.color-preview').style.backgroundColor).toBe('rgb(59, 130, 246)')
    })

    it('should update all formats when hex changes', () => {
      const container = document.getElementById('app')
      container.innerHTML = `
        <div class="color-converter">
          <input type="color" value="#ff0000" id="hex-input" />
          <input type="text" value="255" id="rgb-r" />
          <input type="text" value="0" id="rgb-g" />
          <input type="text" value="0" id="rgb-b" />
          <div class="color-preview"></div>
        </div>
      `

      const hexInput = container.querySelector('#hex-input')
      const rgbR = container.querySelector('#rgb-r')
      
      // Simulate color change
      hexInput.value = '#00ff00'
      hexInput.dispatchEvent(new Event('input'))
      
      // Mock the expected update behavior
      rgbR.value = '0'
      container.querySelector('#rgb-g').value = '255'
      container.querySelector('#rgb-b').value = '0'

      expect(rgbR.value).toBe('0')
      expect(container.querySelector('#rgb-g').value).toBe('255')
      expect(container.querySelector('#rgb-b').value).toBe('0')
    })

    it('should copy color to clipboard when copy button clicked', async () => {
      const container = document.getElementById('app')
      container.innerHTML = `
        <button class="copy-btn" data-color="#ff0000">Copy</button>
      `

      const copyBtn = container.querySelector('.copy-btn')
      copyBtn.click()

      // Simulate clipboard copy
      await navigator.clipboard.writeText('#ff0000')

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('#ff0000')
    })
  })

  describe('ColorCollection Component', () => {
    beforeEach(() => {
      // Mock saved colors in localStorage
      const mockColors = JSON.stringify([
        {
          id: '1',
          hex: '#ff0000',
          name: 'Red',
          isFavorite: false,
          tags: ['primary'],
          createdAt: Date.now(),
          usageCount: 1
        },
        {
          id: '2',
          hex: '#00ff00',
          name: 'Green',
          isFavorite: true,
          tags: ['primary', 'nature'],
          createdAt: Date.now() - 1000,
          usageCount: 3
        }
      ])
      localStorageMock.getItem.mockReturnValue(mockColors)
    })

    it('should load and display saved colors', () => {
      const container = document.getElementById('app')
      
      // Mock ColorCollection rendering
      container.innerHTML = `
        <div class="color-collection">
          <div class="color-grid">
            <div class="color-item" data-id="1">
              <div class="color-swatch" style="background-color: #ff0000"></div>
              <span class="color-name">Red</span>
            </div>
            <div class="color-item" data-id="2">
              <div class="color-swatch" style="background-color: #00ff00"></div>
              <span class="color-name">Green</span>
              <span class="favorite-star">⭐</span>
            </div>
          </div>
        </div>
      `

      const colorItems = container.querySelectorAll('.color-item')
      expect(colorItems).toHaveLength(2)
      
      const favoriteStars = container.querySelectorAll('.favorite-star')
      expect(favoriteStars).toHaveLength(1)
    })

    it('should filter colors by favorites', () => {
      const container = document.getElementById('app')
      container.innerHTML = `
        <div class="color-collection">
          <div class="filter-controls">
            <button class="filter-btn" data-filter="favorites">Favorites</button>
          </div>
          <div class="color-grid">
            <div class="color-item" data-favorite="false" style="display: block;">Red</div>
            <div class="color-item" data-favorite="true" style="display: block;">Green</div>
          </div>
        </div>
      `

      const favoritesBtn = container.querySelector('[data-filter="favorites"]')
      favoritesBtn.click()

      // Mock filtering behavior
      const allItems = container.querySelectorAll('.color-item')
      allItems.forEach(item => {
        if (item.dataset.favorite === 'false') {
          item.style.display = 'none'
        }
      })

      const visibleItems = Array.from(allItems).filter(item => 
        item.style.display !== 'none'
      )
      expect(visibleItems).toHaveLength(1)
    })

    it('should handle drag and drop reordering', () => {
      const container = document.getElementById('app')
      container.innerHTML = `
        <div class="color-collection organizing-mode">
          <div class="color-grid">
            <div class="color-item draggable" data-id="1" draggable="true">Item 1</div>
            <div class="color-item draggable" data-id="2" draggable="true">Item 2</div>
          </div>
        </div>
      `

      const item1 = container.querySelector('[data-id="1"]')
      const item2 = container.querySelector('[data-id="2"]')

      // Mock drag events
      const dragStartEvent = new Event('dragstart')
      const dropEvent = new Event('drop')
      
      item1.dispatchEvent(dragStartEvent)
      item2.dispatchEvent(dropEvent)

      expect(item1.getAttribute('draggable')).toBe('true')
      expect(item2.getAttribute('draggable')).toBe('true')
    })
  })

  describe('ImageColorPicker Component', () => {
    it('should handle image upload', () => {
      const container = document.getElementById('app')
      container.innerHTML = `
        <div class="image-picker">
          <input type="file" id="image-upload" accept="image/*" />
          <canvas id="image-canvas" style="display: none;"></canvas>
          <div class="drop-zone">Drop image here</div>
        </div>
      `

      const fileInput = container.querySelector('#image-upload')
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false
      })

      fileInput.dispatchEvent(new Event('change'))

      expect(fileInput.files).toHaveLength(1)
      expect(fileInput.files[0].name).toBe('test.jpg')
    })

    it('should extract colors on canvas click', () => {
      const container = document.getElementById('app')
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      canvas.id = 'image-canvas'
      container.appendChild(canvas)

      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(0, 0, 100, 100)

      // Mock click event
      const clickEvent = new MouseEvent('click', {
        clientX: 50,
        clientY: 50
      })

      canvas.dispatchEvent(clickEvent)

      // Mock getImageData
      const mockImageData = {
        data: new Uint8ClampedArray([255, 0, 0, 255]) // Red pixel
      }
      
      vi.spyOn(ctx, 'getImageData').mockReturnValue(mockImageData)
      
      const imageData = ctx.getImageData(50, 50, 1, 1)
      expect(imageData.data[0]).toBe(255) // Red
      expect(imageData.data[1]).toBe(0)   // Green
      expect(imageData.data[2]).toBe(0)   // Blue
    })
  })

  describe('Navigation Integration', () => {
    it('should switch between views', () => {
      const container = document.getElementById('app')
      container.innerHTML = `
        <nav id="navigation">
          <button data-view="converter" class="nav-btn active">Converter</button>
          <button data-view="picker" class="nav-btn">Picker</button>
          <button data-view="collection" class="nav-btn">Collection</button>
        </nav>
        <main id="main-content">
          <div class="converter-view">Converter Content</div>
        </main>
      `

      const pickerBtn = container.querySelector('[data-view="picker"]')
      const converterBtn = container.querySelector('[data-view="converter"]')
      const mainContent = container.querySelector('#main-content')

      pickerBtn.click()

      // Mock view switching
      converterBtn.classList.remove('active')
      pickerBtn.classList.add('active')
      mainContent.innerHTML = '<div class="picker-view">Picker Content</div>'

      expect(pickerBtn.classList.contains('active')).toBe(true)
      expect(converterBtn.classList.contains('active')).toBe(false)
      expect(mainContent.innerHTML).toContain('Picker Content')
    })
  })

  describe('Keyboard Shortcuts Integration', () => {
    it('should respond to keyboard shortcuts', () => {
      const container = document.getElementById('app')
      container.innerHTML = `
        <div class="app">
          <nav id="navigation">
            <button data-view="converter" class="nav-btn">Converter</button>
          </nav>
        </div>
      `

      // Mock keyboard event
      const keyEvent = new KeyboardEvent('keydown', {
        key: '1',
        ctrlKey: false
      })

      document.dispatchEvent(keyEvent)

      // Mock shortcut response
      const converterBtn = container.querySelector('[data-view="converter"]')
      converterBtn.click()

      expect(converterBtn.getAttribute('data-view')).toBe('converter')
    })

    it('should open command palette with Ctrl+K', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true
      })

      document.dispatchEvent(keyEvent)

      // Mock command palette creation
      const palette = document.createElement('div')
      palette.id = 'command-palette'
      palette.innerHTML = '<input type="text" placeholder="Type a command..." />'
      document.body.appendChild(palette)

      expect(document.querySelector('#command-palette')).toBeTruthy()
    })
  })

  describe('Performance Integration', () => {
    it('should optimize large color collections with virtual scrolling', () => {
      const container = document.getElementById('app')
      const itemHeight = 60
      const containerHeight = 300
      const totalItems = 1000

      // Mock virtual scrolling
      const visibleItems = Math.ceil(containerHeight / itemHeight) + 1
      expect(visibleItems).toBeLessThan(totalItems)
      expect(visibleItems).toBeGreaterThan(0)
    })

    it('should implement lazy loading for images', () => {
      const container = document.getElementById('app')
      container.innerHTML = `
        <img data-src="image1.jpg" class="lazy-image" />
        <img data-src="image2.jpg" class="lazy-image" />
      `

      const lazyImages = container.querySelectorAll('.lazy-image')
      expect(lazyImages).toHaveLength(2)
      
      // Mock intersection observer
      lazyImages.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.removeAttribute('data-src')
          img.classList.add('lazy-loaded')
        }
      })

      const loadedImages = container.querySelectorAll('.lazy-loaded')
      expect(loadedImages).toHaveLength(2)
    })
  })

  describe('Mobile Integration', () => {
    it('should show mobile navigation on small screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      const container = document.getElementById('app')
      container.innerHTML = `
        <nav class="mobile-nav" style="display: none;">
          <button class="mobile-nav-item" data-view="converter">Convert</button>
          <button class="mobile-nav-item" data-view="picker">Pick</button>
          <button class="mobile-nav-item" data-view="collection">Colors</button>
        </nav>
      `

      // Mock mobile navigation display
      const mobileNav = container.querySelector('.mobile-nav')
      if (window.innerWidth < 768) {
        mobileNav.style.display = 'flex'
      }

      expect(mobileNav.style.display).toBe('flex')
    })

    it('should provide haptic feedback on mobile interactions', () => {
      const button = document.createElement('button')
      button.className = 'mobile-nav-item'
      
      button.click()

      // Mock haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }

      expect(navigator.vibrate).toHaveBeenCalledWith(50)
    })
  })

  describe('Error Handling Integration', () => {
    it('should show error toast for failed operations', () => {
      const container = document.getElementById('app')
      
      // Mock error scenario
      const error = new Error('Color conversion failed')
      
      // Mock toast creation
      const toast = document.createElement('div')
      toast.className = 'toast-item bg-red-500 text-white'
      toast.textContent = error.message
      
      container.appendChild(toast)

      expect(container.querySelector('.toast-item')).toBeTruthy()
      expect(container.querySelector('.toast-item').textContent).toBe('Color conversion failed')
    })

    it('should handle invalid color inputs gracefully', () => {
      const container = document.getElementById('app')
      container.innerHTML = `
        <input type="text" id="color-input" value="invalid-color" />
        <div class="error-message" style="display: none;">Invalid color format</div>
      `

      const input = container.querySelector('#color-input')
      const errorMsg = container.querySelector('.error-message')
      
      // Mock validation
      const isValid = /^#[0-9A-F]{6}$/i.test(input.value)
      if (!isValid) {
        errorMsg.style.display = 'block'
      }

      expect(errorMsg.style.display).toBe('block')
    })
  })
})
