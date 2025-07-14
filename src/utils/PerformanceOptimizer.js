/**
 * Performance Optimization Utilities
 * Handles lazy loading, image optimization, and performance monitoring
 */

export class PerformanceOptimizer {
  constructor() {
    this.imageCache = new Map()
    this.lazyObserver = null
    this.performanceData = {
      imageLoads: [],
      colorConversions: [],
      renderTimes: []
    }
    this.init()
  }

  init() {
    this.setupLazyLoading()
    this.setupImageOptimization()
    this.setupPerformanceMonitoring()
  }

  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadLazyElement(entry.target)
            this.lazyObserver.unobserve(entry.target)
          }
        })
      }, {
        rootMargin: '50px'
      })
    }
  }

  observeLazyElement(element) {
    if (this.lazyObserver) {
      this.lazyObserver.observe(element)
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadLazyElement(element)
    }
  }

  loadLazyElement(element) {
    if (element.dataset.src) {
      element.src = element.dataset.src
      element.removeAttribute('data-src')
    }
    
    if (element.dataset.content) {
      element.innerHTML = element.dataset.content
      element.removeAttribute('data-content')
    }
    
    element.classList.add('lazy-loaded')
  }

  setupImageOptimization() {
    // Canvas optimization for image processing
    this.canvasPool = []
    this.maxCanvasPoolSize = 3
  }

  getOptimizedCanvas(width, height) {
    // Reuse canvas elements to reduce memory allocation
    let canvas = this.canvasPool.pop()
    
    if (!canvas) {
      canvas = document.createElement('canvas')
    }
    
    canvas.width = width
    canvas.height = height
    
    return canvas
  }

  releaseCanvas(canvas) {
    if (this.canvasPool.length < this.maxCanvasPoolSize) {
      // Clear canvas
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.canvasPool.push(canvas)
    }
  }

  optimizeImage(file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = this.getOptimizedCanvas(maxWidth, maxHeight)
        const ctx = canvas.getContext('2d')
        
        // Calculate optimal dimensions
        const { width, height } = this.calculateOptimalSize(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight
        )
        
        canvas.width = width
        canvas.height = height
        
        // Draw optimized image
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob
        canvas.toBlob((blob) => {
          this.releaseCanvas(canvas)
          resolve({
            blob,
            width,
            height,
            originalSize: file.size,
            optimizedSize: blob.size,
            compressionRatio: file.size / blob.size
          })
        }, 'image/jpeg', quality)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  calculateOptimalSize(originalWidth, originalHeight, maxWidth, maxHeight) {
    let { width, height } = { width: originalWidth, height: originalHeight }
    
    // Scale down if larger than max dimensions
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height)
      width *= ratio
      height *= ratio
    }
    
    return { width: Math.round(width), height: Math.round(height) }
  }

  setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log('LCP:', lastEntry.startTime)
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime)
        })
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        let cls = 0
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            cls += entry.value
          }
        })
        console.log('CLS:', cls)
      }).observe({ entryTypes: ['layout-shift'] })
    }
  }

  // Debounce utility for performance
  debounce(func, wait, immediate = false) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        timeout = null
        if (!immediate) func(...args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func(...args)
    }
  }

  // Throttle utility for performance
  throttle(func, limit) {
    let inThrottle
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // Memory management for large datasets
  createVirtualList(container, items, itemHeight, renderItem) {
    const containerHeight = container.clientHeight
    const visibleItems = Math.ceil(containerHeight / itemHeight) + 1
    let scrollTop = 0
    
    const updateVisibleItems = this.throttle(() => {
      const start = Math.floor(scrollTop / itemHeight)
      const end = Math.min(start + visibleItems, items.length)
      
      container.innerHTML = ''
      container.style.height = `${items.length * itemHeight}px`
      
      for (let i = start; i < end; i++) {
        const item = renderItem(items[i], i)
        item.style.position = 'absolute'
        item.style.top = `${i * itemHeight}px`
        item.style.height = `${itemHeight}px`
        container.appendChild(item)
      }
    }, 16)
    
    container.addEventListener('scroll', (e) => {
      scrollTop = e.target.scrollTop
      updateVisibleItems()
    })
    
    updateVisibleItems()
  }

  // Batch DOM updates for better performance
  batchDOMUpdates(updates) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        updates.forEach(update => update())
        resolve()
      })
    })
  }

  // Preload critical resources
  preloadResources(resources) {
    resources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource.url
      link.as = resource.type
      
      if (resource.type === 'font') {
        link.crossOrigin = 'anonymous'
      }
      
      document.head.appendChild(link)
    })
  }

  // Web Worker utility for heavy computations
  createWorker(workerFunction) {
    const blob = new Blob([`(${workerFunction.toString()})()`], {
      type: 'application/javascript'
    })
    return new Worker(URL.createObjectURL(blob))
  }

  // Color processing worker
  createColorProcessingWorker() {
    return this.createWorker(() => {
      self.onmessage = function(e) {
        const { imageData, operation } = e.data
        
        switch (operation) {
          case 'extractDominantColor':
            const dominantColor = extractDominantColor(imageData)
            self.postMessage({ result: dominantColor })
            break
            
          case 'generatePalette':
            const palette = generateColorPalette(imageData)
            self.postMessage({ result: palette })
            break
            
          default:
            self.postMessage({ error: 'Unknown operation' })
        }
      }
      
      function extractDominantColor(imageData) {
        const data = imageData.data
        const colorCounts = {}
        
        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const key = `${r},${g},${b}`
          colorCounts[key] = (colorCounts[key] || 0) + 1
        }
        
        let maxCount = 0
        let dominantColor = null
        
        for (const [color, count] of Object.entries(colorCounts)) {
          if (count > maxCount) {
            maxCount = count
            dominantColor = color.split(',').map(Number)
          }
        }
        
        return dominantColor
      }
      
      function generateColorPalette(imageData, paletteSize = 5) {
        // Simplified k-means clustering for color palette
        const data = imageData.data
        const colors = []
        
        // Sample colors
        for (let i = 0; i < data.length; i += 20) {
          colors.push([data[i], data[i + 1], data[i + 2]])
        }
        
        // Simple clustering (simplified for web worker)
        const palette = []
        const step = Math.floor(colors.length / paletteSize)
        
        for (let i = 0; i < paletteSize; i++) {
          const index = i * step
          if (index < colors.length) {
            palette.push(colors[index])
          }
        }
        
        return palette
      }
    })
  }

  // Measure and record performance metrics
  measurePerformance(operation, fn) {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    const duration = end - start
    
    this.performanceData[operation] = this.performanceData[operation] || []
    this.performanceData[operation].push(duration)
    
    // Keep only last 100 measurements
    if (this.performanceData[operation].length > 100) {
      this.performanceData[operation].shift()
    }
    
    return result
  }

  // Get performance insights
  getPerformanceInsights() {
    const insights = {}
    
    Object.entries(this.performanceData).forEach(([operation, measurements]) => {
      if (measurements.length === 0) {
        insights[operation] = null
        return
      }
      
      const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length
      const min = Math.min(...measurements)
      const max = Math.max(...measurements)
      
      insights[operation] = { avg, min, max, count: measurements.length }
    })
    
    return insights
  }

  // Cleanup resources
  cleanup() {
    if (this.lazyObserver) {
      this.lazyObserver.disconnect()
    }
    
    // Clear canvas pool
    this.canvasPool = []
    
    // Clear performance data
    this.performanceData = {
      imageLoads: [],
      colorConversions: [],
      renderTimes: []
    }
  }
}
