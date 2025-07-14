/**
 * Test Setup Configuration
 * Global setup for all tests
 */

import { vi } from 'vitest'
import 'jsdom'

// Mock browser APIs
global.navigator = {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue('#FF0000')
  },
  vibrate: vi.fn(),
  userAgent: 'test-agent'
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

global.localStorage = localStorageMock

// Mock sessionStorage
global.sessionStorage = localStorageMock

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn()
}))

// Mock performance API
global.performance = {
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => []),
  mark: vi.fn(),
  measure: vi.fn()
}

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16)
  return 1
})

global.cancelAnimationFrame = vi.fn()

// Mock matchMedia
global.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}))

// Mock URL API
global.URL = {
  createObjectURL: vi.fn(() => 'mock-object-url'),
  revokeObjectURL: vi.fn()
}

// Mock File API
global.File = class File {
  constructor(chunks, filename, options = {}) {
    this.chunks = chunks
    this.name = filename
    this.size = chunks.reduce((size, chunk) => size + chunk.length, 0)
    this.type = options.type || ''
    this.lastModified = options.lastModified || Date.now()
  }
}

global.FileReader = class FileReader {
  constructor() {
    this.readyState = 0
    this.result = null
    this.error = null
    this.onload = null
    this.onerror = null
    this.onabort = null
  }

  readAsDataURL(file) {
    setTimeout(() => {
      this.readyState = 2
      this.result = 'data:image/jpeg;base64,mock-base64-data'
      if (this.onload) this.onload({ target: this })
    }, 10)
  }

  readAsText(file) {
    setTimeout(() => {
      this.readyState = 2
      this.result = 'mock file content'
      if (this.onload) this.onload({ target: this })
    }, 10)
  }

  abort() {
    this.readyState = 2
    if (this.onabort) this.onabort({ target: this })
  }
}

// Mock canvas API
global.HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType) => {
  if (contextType === '2d') {
    return {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray([255, 0, 0, 255]),
        width: 1,
        height: 1
      }),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      rect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      transform: vi.fn(),
      setTransform: vi.fn()
    }
  }
  return null
})

global.HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((callback) => {
  setTimeout(() => {
    callback(new Blob(['mock canvas data'], { type: 'image/png' }))
  }, 10)
})

global.HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock-data')

// Mock Image
global.Image = class Image {
  constructor() {
    this.width = 0
    this.height = 0
    this.src = ''
    this.onload = null
    this.onerror = null
  }

  set src(value) {
    this._src = value
    setTimeout(() => {
      this.width = 100
      this.height = 100
      if (this.onload) this.onload()
    }, 10)
  }

  get src() {
    return this._src
  }
}

// Mock Web Workers
global.Worker = class Worker {
  constructor(scriptURL) {
    this.scriptURL = scriptURL
    this.onmessage = null
    this.onerror = null
  }

  postMessage(message) {
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ data: { result: 'mock worker result' } })
      }
    }, 10)
  }

  terminate() {
    // Mock cleanup
  }
}

// Console methods for testing
const originalConsole = global.console
global.console = {
  ...originalConsole,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}

// Global test utilities
global.testUtils = {
  createMockEvent(type, properties = {}) {
    return new Event(type, properties)
  },
  
  createMockMouseEvent(type, properties = {}) {
    return new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      ...properties
    })
  },
  
  createMockKeyboardEvent(type, properties = {}) {
    return new KeyboardEvent(type, {
      bubbles: true,
      cancelable: true,
      ...properties
    })
  },
  
  createMockTouchEvent(type, properties = {}) {
    return new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      ...properties
    })
  },
  
  waitFor(condition, timeout = 1000) {
    return new Promise((resolve, reject) => {
      const start = Date.now()
      const check = () => {
        if (condition()) {
          resolve()
        } else if (Date.now() - start > timeout) {
          reject(new Error('Condition not met within timeout'))
        } else {
          setTimeout(check, 10)
        }
      }
      check()
    })
  }
}

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
  document.body.innerHTML = ''
  localStorageMock.clear()
})
