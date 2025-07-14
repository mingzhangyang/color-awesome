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
              <h3 class="text-lg font-semibold">Click on the image to pick colors</h3>
              <button class="btn-secondary" id="clear-image">Clear Image</button>
            </div>
            <div class="relative">
              <canvas id="image-canvas" class="max-w-full h-auto border rounded cursor-crosshair"></canvas>
              <div id="color-picker-info" class="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm hidden">
                Click to pick color
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

    // Show canvas
    canvasContainer.classList.remove('hidden')
    
    // Clear previous colors
    this.extractedColors = []
    this.updateColorGrid()
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

  updateColorGrid() {
    const colorGrid = document.getElementById('color-grid')
    
    colorGrid.innerHTML = this.extractedColors.map(color => `
      <div class="group relative">
        <div class="aspect-square rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
             style="background-color: ${color.hex}"
             title="${color.hex}">
        </div>
        <div class="text-xs text-center mt-1 font-mono">${color.hex}</div>
        <button class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                onclick="this.closest('.group').remove()">×</button>
      </div>
    `).join('')
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

    alert('Dominant color extraction coming soon!')
    // TODO: Implement dominant color extraction algorithm
  }

  generatePalette() {
    if (!this.imageData) {
      alert('Please load an image first!')
      return
    }

    alert('Palette generation coming soon!')
    // TODO: Implement palette generation algorithm
  }

  analyzeColors() {
    if (this.extractedColors.length === 0) {
      alert('Please pick some colors first!')
      return
    }

    alert('Color analysis coming soon!')
    // TODO: Implement color analysis features
  }

  // Utility function
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }
}
