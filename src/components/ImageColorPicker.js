export class ImageColorPicker {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.imageData = null
    this.extractedColors = []
  }

  render(container) {
    container.innerHTML = `
      <div class="space-y-8">
        <!-- Hero Section -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Image Color Picker</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Upload an image and extract colors by clicking on it. 
            Build beautiful color palettes from your favorite images.
          </p>
        </div>

        <!-- Upload Area -->
        <div class="card max-w-md mx-auto">
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center" id="upload-area">
            <div class="space-y-4">
              <div class="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                📷
              </div>
              <div>
                <p class="text-gray-600">Drop an image here or</p>
                <button class="btn-primary mt-2">Choose File</button>
                <input type="file" id="image-input" accept="image/*" class="hidden">
              </div>
              <p class="text-xs text-gray-400">PNG, JPG, JPEG up to 10MB</p>
            </div>
          </div>
        </div>

        <!-- Image Canvas Area -->
        <div id="canvas-container" class="hidden">
          <div class="card">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h3 class="text-lg font-semibold">Click on the image to pick colors</h3>
                <p class="text-sm text-gray-600" id="cursor-info">Move mouse over image to see color preview</p>
              </div>
              <div class="flex space-x-2">
                <button class="btn-secondary" id="toggle-eyedropper" title="Toggle Eyedropper Mode">
                  🔍 Eyedropper
                </button>
                <button class="btn-secondary" id="clear-image">Clear Image</button>
              </div>
            </div>
            
            <!-- Zoom and Tool Controls -->
            <div class="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded">
              <div class="flex items-center space-x-4">
                <span class="text-sm font-medium">Zoom:</span>
                <button class="btn-sm" id="zoom-out">−</button>
                <span class="text-sm font-mono" id="zoom-level">100%</span>
                <button class="btn-sm" id="zoom-in">+</button>
                <button class="btn-sm" id="zoom-reset">Reset</button>
              </div>
              
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 border-2 border-gray-300 rounded" id="live-color-preview" style="background-color: #ffffff"></div>
                <span class="text-sm font-mono" id="live-color-hex">#ffffff</span>
              </div>
            </div>
            
            <div class="relative overflow-auto max-h-96 border rounded" id="canvas-wrapper">
              <canvas id="image-canvas" class="cursor-crosshair transition-transform" style="transform-origin: top left;"></canvas>
              <div id="color-picker-info" class="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm pointer-events-none">
                <div id="picker-coordinates"></div>
                <div id="picker-color"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Extracted Colors -->
        <div id="extracted-colors-section" class="hidden">
          <div class="card">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Extracted Colors</h3>
              <div class="space-x-2">
                <button class="btn-secondary" id="clear-colors">Clear All</button>
                <button class="btn-primary" id="save-palette">Save Palette</button>
              </div>
            </div>
            <div id="color-grid" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              <!-- Colors will be inserted here -->
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button class="btn-secondary p-4 text-left" id="extract-dominant">
              <div class="font-medium">Extract Dominant Colors</div>
              <div class="text-sm text-gray-600">Get the most prominent colors automatically</div>
            </button>
            <button class="btn-secondary p-4 text-left" id="extract-palette">
              <div class="font-medium">Generate Palette</div>
              <div class="text-sm text-gray-600">Create a harmonious color palette</div>
            </button>
            <button class="btn-secondary p-4 text-left" id="analyze-colors">
              <div class="font-medium">Analyze Colors</div>
              <div class="text-sm text-gray-600">Get detailed color statistics</div>
            </button>
          </div>
        </div>
      </div>
    `

    this.setupEventListeners()
  }

  setupEventListeners() {
    // File input
    const imageInput = document.getElementById('image-input')
    const uploadArea = document.getElementById('upload-area')
    const chooseFileBtn = uploadArea.querySelector('.btn-primary')

    chooseFileBtn.addEventListener('click', () => imageInput.click())

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) {
        this.loadImage(file)
      }
    })

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault()
      uploadArea.classList.add('border-primary-300', 'bg-primary-50')
    })

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault()
      uploadArea.classList.remove('border-primary-300', 'bg-primary-50')
    })

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault()
      uploadArea.classList.remove('border-primary-300', 'bg-primary-50')
      
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        this.loadImage(file)
      }
    })

    // Canvas click for color picking
    document.addEventListener('click', (e) => {
      if (e.target.id === 'image-canvas') {
        this.pickColorFromCanvas(e)
      }
    })

    // Action buttons
    document.getElementById('clear-image')?.addEventListener('click', () => {
      this.clearImage()
    })

    document.getElementById('clear-colors')?.addEventListener('click', () => {
      this.clearExtractedColors()
    })

    document.getElementById('save-palette')?.addEventListener('click', () => {
      this.savePalette()
    })

    document.getElementById('extract-dominant')?.addEventListener('click', () => {
      this.extractDominantColors()
    })

    document.getElementById('extract-palette')?.addEventListener('click', () => {
      this.generatePalette()
    })

    document.getElementById('analyze-colors')?.addEventListener('click', () => {
      this.analyzeColors()
    })

    // Enhanced canvas interactions
    this.setupCanvasInteractions()
  }

  setupCanvasInteractions() {
    const canvas = document.getElementById('image-canvas')
    const colorPreview = document.getElementById('live-color-preview')
    const colorHex = document.getElementById('live-color-hex')
    const pickerInfo = document.getElementById('color-picker-info')
    const coordinates = document.getElementById('picker-coordinates')
    const pickerColor = document.getElementById('picker-color')
    
    this.zoomLevel = 1
    this.isEyedropperMode = false
    
    // Zoom controls
    document.getElementById('zoom-in')?.addEventListener('click', () => {
      this.zoomLevel = Math.min(this.zoomLevel * 1.2, 5)
      this.updateZoom()
    })
    
    document.getElementById('zoom-out')?.addEventListener('click', () => {
      this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.1)
      this.updateZoom()
    })
    
    document.getElementById('zoom-reset')?.addEventListener('click', () => {
      this.zoomLevel = 1
      this.updateZoom()
    })
    
    // Eyedropper toggle
    document.getElementById('toggle-eyedropper')?.addEventListener('click', () => {
      this.isEyedropperMode = !this.isEyedropperMode
      const btn = document.getElementById('toggle-eyedropper')
      if (this.isEyedropperMode) {
        btn.textContent = '🎯 Normal Mode'
        btn.classList.add('bg-primary-100', 'border-primary-300')
        canvas.style.cursor = 'crosshair'
      } else {
        btn.textContent = '🔍 Eyedropper'
        btn.classList.remove('bg-primary-100', 'border-primary-300')
        canvas.style.cursor = 'pointer'
      }
    })
    
    // Mouse move for live preview
    canvas?.addEventListener('mousemove', (e) => {
      if (!this.ctx || !this.imageData) return
      
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      
      const x = Math.floor((e.clientX - rect.left) * scaleX / this.zoomLevel)
      const y = Math.floor((e.clientY - rect.top) * scaleY / this.zoomLevel)
      
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const pixelData = this.getPixelColor(x, y)
        const hex = this.rgbToHex(pixelData.r, pixelData.g, pixelData.b)
        
        if (colorPreview) colorPreview.style.backgroundColor = hex
        if (colorHex) colorHex.textContent = hex
        
        if (coordinates) coordinates.textContent = `${x}, ${y}`
        if (pickerColor) pickerColor.textContent = hex
        
        if (pickerInfo) {
          pickerInfo.style.display = 'block'
          pickerInfo.style.left = `${e.clientX - rect.left + 10}px`
          pickerInfo.style.top = `${e.clientY - rect.top - 40}px`
        }
      }
    })
    
    canvas?.addEventListener('mouseleave', () => {
      if (pickerInfo) pickerInfo.style.display = 'none'
    })
  }

  loadImage(file) {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        this.displayImage(img)
      }
      
      img.src = e.target.result
    }
    
    reader.readAsDataURL(file)
  }

  displayImage(img) {
    const canvasContainer = document.getElementById('canvas-container')
    const canvas = document.getElementById('image-canvas')
    const ctx = canvas.getContext('2d')

    // Calculate display size (max 800px width)
    const maxWidth = 800
    const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
    const displayWidth = img.width * ratio
    const displayHeight = img.height * ratio

    canvas.width = displayWidth
    canvas.height = displayHeight

    // Draw image
    ctx.drawImage(img, 0, 0, displayWidth, displayHeight)

    // Store image data for color picking
    this.canvas = canvas
    this.ctx = ctx
    this.imageData = ctx.getImageData(0, 0, displayWidth, displayHeight)

    // Initialize zoom and interaction features
    this.zoomLevel = 1
    this.isEyedropperMode = false
    this.updateZoom()

    // Show canvas
    canvasContainer.classList.remove('hidden')
    
    // Clear previous colors
    this.extractedColors = []
    this.updateColorGrid()
    
    // Setup enhanced interactions if not already done
    if (!this.interactionsSetup) {
      this.setupCanvasInteractions()
      this.interactionsSetup = true
    }
  }

  pickColorFromCanvas(event) {
    if (!this.imageData) return

    const rect = this.canvas.getBoundingClientRect()
    const x = Math.floor(event.clientX - rect.left)
    const y = Math.floor(event.clientY - rect.top)

    // Get pixel data
    const pixelIndex = (y * this.imageData.width + x) * 4
    const r = this.imageData.data[pixelIndex]
    const g = this.imageData.data[pixelIndex + 1]
    const b = this.imageData.data[pixelIndex + 2]

    // Convert to hex
    const hex = this.rgbToHex(r, g, b)

    // Add to extracted colors
    const colorData = {
      hex,
      rgb: { r, g, b },
      position: { x, y },
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    }

    this.extractedColors.push(colorData)
    this.updateColorGrid()

    // Show extracted colors section
    document.getElementById('extracted-colors-section').classList.remove('hidden')
  }

  addExtractedColor(hex, r, g, b) {
    // Check if color already exists
    const existingColor = this.extractedColors.find(color => color.hex.toLowerCase() === hex.toLowerCase())
    if (existingColor) {
      return // Don't add duplicates
    }
    
    const colorData = {
      hex: hex,
      r: r,
      g: g,
      b: b,
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random() // Ensure uniqueness
    }
    
    this.extractedColors.push(colorData)
    this.updateColorGrid()
  }

  updateColorGrid() {
    const colorGrid = document.getElementById('color-grid')
    const extractedSection = document.getElementById('extracted-colors-section')
    
    if (this.extractedColors.length > 0) {
      extractedSection.classList.remove('hidden')
      
      colorGrid.innerHTML = this.extractedColors.map(color => `
        <div class="group relative">
          <div class="aspect-square rounded border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
               style="background-color: ${color.hex}"
               onclick="navigator.clipboard.writeText('${color.hex}'); this.showToast('Copied ${color.hex}')"
               title="Click to copy ${color.hex}">
          </div>
          <div class="text-xs text-center mt-1 font-mono">${color.hex}</div>
          
          <!-- Remove button -->
          <button class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onclick="this.removeExtractedColor('${color.id}')" title="Remove">
            ×
          </button>
        </div>
      `).join('')
    } else {
      extractedSection.classList.add('hidden')
    }
  }

  removeExtractedColor(colorId) {
    this.extractedColors = this.extractedColors.filter(color => color.id.toString() !== colorId)
    this.updateColorGrid()
  }

  clearImage() {
    document.getElementById('canvas-container').classList.add('hidden')
    document.getElementById('extracted-colors-section').classList.add('hidden')
    document.getElementById('image-input').value = ''
    this.canvas = null
    this.ctx = null
    this.imageData = null
    this.extractedColors = []
  }

  clearExtractedColors() {
    this.extractedColors = []
    this.updateColorGrid()
    document.getElementById('extracted-colors-section').classList.add('hidden')
  }

  savePalette() {
    if (this.extractedColors.length === 0) {
      alert('No colors to save!')
      return
    }

    // TODO: Integrate with ColorCollection storage
    const palettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]')
    const paletteData = {
      name: `Palette ${new Date().toLocaleDateString()}`,
      colors: this.extractedColors,
      timestamp: new Date().toISOString(),
      id: Date.now()
    }
    
    palettes.push(paletteData)
    localStorage.setItem('savedPalettes', JSON.stringify(palettes))
    
    alert('Palette saved successfully!')
  }

  extractDominantColors() {
    if (!this.imageData) {
      alert('Please load an image first!')
      return
    }

    // Get all pixel data
    const data = this.imageData.data
    const colorMap = new Map()
    
    // Sample every 4th pixel for performance (can be adjusted)
    const step = 4
    
    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      // Skip transparent pixels
      if (a < 128) continue
      
      // Group similar colors (reduce precision for better clustering)
      const clusteredR = Math.round(r / 16) * 16
      const clusteredG = Math.round(g / 16) * 16
      const clusteredB = Math.round(b / 16) * 16
      
      const colorKey = `${clusteredR},${clusteredG},${clusteredB}`
      
      if (colorMap.has(colorKey)) {
        colorMap.set(colorKey, {
          count: colorMap.get(colorKey).count + 1,
          r: clusteredR,
          g: clusteredG,
          b: clusteredB
        })
      } else {
        colorMap.set(colorKey, {
          count: 1,
          r: clusteredR,
          g: clusteredG,
          b: clusteredB
        })
      }
    }
    
    // Sort by frequency and get top 8 colors
    const sortedColors = Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    
    // Clear existing colors and add dominant ones
    this.extractedColors = []
    sortedColors.forEach(color => {
      const hex = this.rgbToHex(color.r, color.g, color.b)
      this.addExtractedColor(hex, color.r, color.g, color.b)
    })
    
    this.showToast(`Found ${sortedColors.length} dominant colors!`)
  }

  generatePalette() {
    if (!this.imageData) {
      alert('Please load an image first!')
      return
    }

    // First extract dominant colors
    const data = this.imageData.data
    const colorMap = new Map()
    
    // Sample pixels for analysis
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      if (a < 128) continue
      
      // Convert to HSL for better color harmony
      const hsl = this.rgbToHsl(r, g, b)
      
      // Group colors by hue (30-degree segments)
      const hueGroup = Math.floor(hsl.h / 30) * 30
      const key = `${hueGroup}-${Math.floor(hsl.s / 20)}-${Math.floor(hsl.l / 20)}`
      
      if (colorMap.has(key)) {
        const existing = colorMap.get(key)
        colorMap.set(key, {
          count: existing.count + 1,
          r: Math.round((existing.r * existing.count + r) / (existing.count + 1)),
          g: Math.round((existing.g * existing.count + g) / (existing.count + 1)),
          b: Math.round((existing.b * existing.count + b) / (existing.count + 1)),
          hue: hueGroup
        })
      } else {
        colorMap.set(key, { count: 1, r, g, b, hue: hueGroup })
      }
    }
    
    // Get top colors from different hue ranges for diversity
    const hueGroups = new Map()
    Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count)
      .forEach(color => {
        if (!hueGroups.has(color.hue) && hueGroups.size < 6) {
          hueGroups.set(color.hue, color)
        }
      })
    
    // If we don't have enough diverse colors, fill with top colors
    const remainingColors = Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count)
      .filter(color => !Array.from(hueGroups.values()).includes(color))
      .slice(0, 6 - hueGroups.size)
    
    const finalColors = [...hueGroups.values(), ...remainingColors]
    
    // Clear and add generated palette
    this.extractedColors = []
    finalColors.forEach(color => {
      const hex = this.rgbToHex(color.r, color.g, color.b)
      this.addExtractedColor(hex, color.r, color.g, color.b)
    })
    
    this.showToast(`Generated palette with ${finalColors.length} harmonious colors!`)
  }

  analyzeColors() {
    if (this.extractedColors.length === 0) {
      alert('Please pick some colors first!')
      return
    }

    // Analyze the extracted colors
    const analysis = {
      totalColors: this.extractedColors.length,
      avgBrightness: 0,
      avgSaturation: 0,
      hueDistribution: new Map(),
      colorTemperature: 'neutral'
    }
    
    let totalBrightness = 0
    let totalSaturation = 0
    let warmColors = 0
    let coolColors = 0
    
    this.extractedColors.forEach(colorData => {
      const hsl = this.rgbToHsl(colorData.r, colorData.g, colorData.b)
      
      totalBrightness += hsl.l
      totalSaturation += hsl.s
      
      // Categorize hue
      const hue = hsl.h
      let hueCategory = ''
      if (hue >= 0 && hue < 60) hueCategory = 'Red-Orange'
      else if (hue >= 60 && hue < 120) hueCategory = 'Yellow-Green'
      else if (hue >= 120 && hue < 180) hueCategory = 'Green-Cyan'
      else if (hue >= 180 && hue < 240) hueCategory = 'Cyan-Blue'
      else if (hue >= 240 && hue < 300) hueCategory = 'Blue-Purple'
      else hueCategory = 'Purple-Red'
      
      analysis.hueDistribution.set(hueCategory, 
        (analysis.hueDistribution.get(hueCategory) || 0) + 1)
      
      // Determine warm vs cool
      if ((hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)) {
        warmColors++
      } else if (hue >= 120 && hue <= 300) {
        coolColors++
      }
    })
    
    analysis.avgBrightness = Math.round(totalBrightness / this.extractedColors.length)
    analysis.avgSaturation = Math.round(totalSaturation / this.extractedColors.length)
    
    if (warmColors > coolColors * 1.5) {
      analysis.colorTemperature = 'warm'
    } else if (coolColors > warmColors * 1.5) {
      analysis.colorTemperature = 'cool'
    }
    
    // Display analysis results
    this.showColorAnalysis(analysis)
  }

  showColorAnalysis(analysis) {
    const analysisHtml = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="analysis-modal">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Color Analysis Results</h3>
            <button class="text-gray-400 hover:text-gray-600" onclick="document.getElementById('analysis-modal').remove()">✕</button>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Total Colors:</span>
              <span class="font-medium">${analysis.totalColors}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">Average Brightness:</span>
              <span class="font-medium">${analysis.avgBrightness}%</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">Average Saturation:</span>
              <span class="font-medium">${analysis.avgSaturation}%</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">Color Temperature:</span>
              <span class="font-medium capitalize">${analysis.colorTemperature}</span>
            </div>
            
            <div>
              <span class="text-gray-600 block mb-2">Hue Distribution:</span>
              <div class="space-y-1">
                ${Array.from(analysis.hueDistribution.entries()).map(([hue, count]) => 
                  `<div class="flex justify-between text-sm">
                    <span>${hue}:</span>
                    <span>${count} color${count > 1 ? 's' : ''}</span>
                  </div>`
                ).join('')}
              </div>
            </div>
          </div>
          
          <button class="btn-primary w-full mt-4" onclick="document.getElementById('analysis-modal').remove()">
            Close
          </button>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', analysisHtml)
  }

  rgbToHsl(r, g, b) {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }

      h /= 6
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  // Utility function
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  showToast(message) {
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-up'
    toast.textContent = message
    
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.remove()
    }, 3000)
  }

  updateZoom() {
    const canvas = document.getElementById('image-canvas')
    const zoomLevelSpan = document.getElementById('zoom-level')
    
    if (canvas) {
      canvas.style.transform = `scale(${this.zoomLevel})`
    }
    
    if (zoomLevelSpan) {
      zoomLevelSpan.textContent = `${Math.round(this.zoomLevel * 100)}%`
    }
  }

  getPixelColor(x, y) {
    if (!this.imageData) return { r: 0, g: 0, b: 0, a: 0 }
    
    const canvas = document.getElementById('image-canvas')
    const index = (y * canvas.width + x) * 4
    
    return {
      r: this.imageData.data[index],
      g: this.imageData.data[index + 1],
      b: this.imageData.data[index + 2],
      a: this.imageData.data[index + 3]
    }
  }
}
