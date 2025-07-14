export class ColorConverter {
  constructor() {
    this.currentColor = '#3b82f6'
  }

  render(container) {
    container.innerHTML = `
      <div class="space-y-8">
        <!-- Hero Section -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Color Converter</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Convert colors between different formats including RGB, HEX, HSL, and more. 
            Real-time conversion with live preview.
          </p>
        </div>

        <!-- Color Preview -->
        <div class="card max-w-md mx-auto text-center">
          <div class="w-full h-32 rounded-lg mb-4 border-2 border-gray-200" 
               style="background-color: ${this.currentColor}" 
               id="color-preview">
          </div>
          <p class="text-sm text-gray-600">Current Color Preview</p>
        </div>

        <!-- Conversion Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- HEX Input -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-2">HEX</label>
            <input 
              type="text" 
              id="hex-input" 
              class="input-field font-mono" 
              placeholder="#3b82f6"
              value="${this.currentColor}"
            >
            <button class="btn-secondary mt-2 w-full" onclick="navigator.clipboard.writeText(document.getElementById('hex-input').value)">
              Copy HEX
            </button>
          </div>

          <!-- RGB Input -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-2">RGB</label>
            <div class="space-y-2">
              <input type="number" id="rgb-r" class="input-field" placeholder="R" min="0" max="255">
              <input type="number" id="rgb-g" class="input-field" placeholder="G" min="0" max="255">
              <input type="number" id="rgb-b" class="input-field" placeholder="B" min="0" max="255">
            </div>
            <button class="btn-secondary mt-2 w-full" id="copy-rgb">
              Copy RGB
            </button>
          </div>

          <!-- HSL Input -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-2">HSL</label>
            <div class="space-y-2">
              <input type="number" id="hsl-h" class="input-field" placeholder="H" min="0" max="360">
              <input type="number" id="hsl-s" class="input-field" placeholder="S%" min="0" max="100">
              <input type="number" id="hsl-l" class="input-field" placeholder="L%" min="0" max="100">
            </div>
            <button class="btn-secondary mt-2 w-full" id="copy-hsl">
              Copy HSL
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-center space-x-4">
          <button class="btn-primary" id="save-color">
            💾 Save Color
          </button>
          <button class="btn-secondary" id="random-color">
            🎲 Random Color
          </button>
        </div>

        <!-- Color Harmony Preview (Coming Soon) -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Color Harmony (Coming Soon)</h3>
          <div class="grid grid-cols-5 gap-2">
            ${Array(5).fill(0).map(() => `
              <div class="h-16 bg-gray-200 rounded opacity-50"></div>
            `).join('')}
          </div>
          <p class="text-sm text-gray-500 mt-2">Complementary, triadic, and analogous colors will be shown here.</p>
        </div>
      </div>
    `

    this.setupEventListeners()
    this.updateColorValues()
  }

  setupEventListeners() {
    // HEX input
    const hexInput = document.getElementById('hex-input')
    hexInput.addEventListener('input', (e) => {
      this.currentColor = e.target.value
      this.updateColorPreview()
      this.updateColorValues()
    })

    // RGB inputs
    const rgbR = document.getElementById('rgb-r')
    const rgbG = document.getElementById('rgb-g')
    const rgbB = document.getElementById('rgb-b')

    [rgbR, rgbG, rgbB].forEach(input => {
      input.addEventListener('input', () => {
        this.updateFromRGB()
      })
    })

    // HSL inputs
    const hslH = document.getElementById('hsl-h')
    const hslS = document.getElementById('hsl-s')
    const hslL = document.getElementById('hsl-l')

    [hslH, hslS, hslL].forEach(input => {
      input.addEventListener('input', () => {
        this.updateFromHSL()
      })
    })

    // Copy buttons
    document.getElementById('copy-rgb').addEventListener('click', () => {
      const r = document.getElementById('rgb-r').value
      const g = document.getElementById('rgb-g').value
      const b = document.getElementById('rgb-b').value
      navigator.clipboard.writeText(`rgb(${r}, ${g}, ${b})`)
    })

    document.getElementById('copy-hsl').addEventListener('click', () => {
      const h = document.getElementById('hsl-h').value
      const s = document.getElementById('hsl-s').value
      const l = document.getElementById('hsl-l').value
      navigator.clipboard.writeText(`hsl(${h}, ${s}%, ${l}%)`)
    })

    // Action buttons
    document.getElementById('save-color').addEventListener('click', () => {
      this.saveColor()
    })

    document.getElementById('random-color').addEventListener('click', () => {
      this.generateRandomColor()
    })
  }

  updateColorPreview() {
    const preview = document.getElementById('color-preview')
    if (preview) {
      preview.style.backgroundColor = this.currentColor
    }
  }

  updateColorValues() {
    // Convert HEX to RGB and HSL
    const rgb = this.hexToRgb(this.currentColor)
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)

    // Update RGB inputs
    document.getElementById('rgb-r').value = rgb.r
    document.getElementById('rgb-g').value = rgb.g
    document.getElementById('rgb-b').value = rgb.b

    // Update HSL inputs
    document.getElementById('hsl-h').value = Math.round(hsl.h)
    document.getElementById('hsl-s').value = Math.round(hsl.s)
    document.getElementById('hsl-l').value = Math.round(hsl.l)

    this.updateColorPreview()
  }

  updateFromRGB() {
    const r = parseInt(document.getElementById('rgb-r').value) || 0
    const g = parseInt(document.getElementById('rgb-g').value) || 0
    const b = parseInt(document.getElementById('rgb-b').value) || 0

    this.currentColor = this.rgbToHex(r, g, b)
    document.getElementById('hex-input').value = this.currentColor

    const hsl = this.rgbToHsl(r, g, b)
    document.getElementById('hsl-h').value = Math.round(hsl.h)
    document.getElementById('hsl-s').value = Math.round(hsl.s)
    document.getElementById('hsl-l').value = Math.round(hsl.l)

    this.updateColorPreview()
  }

  updateFromHSL() {
    const h = parseInt(document.getElementById('hsl-h').value) || 0
    const s = parseInt(document.getElementById('hsl-s').value) || 0
    const l = parseInt(document.getElementById('hsl-l').value) || 0

    const rgb = this.hslToRgb(h / 360, s / 100, l / 100)
    
    document.getElementById('rgb-r').value = rgb.r
    document.getElementById('rgb-g').value = rgb.g
    document.getElementById('rgb-b').value = rgb.b

    this.currentColor = this.rgbToHex(rgb.r, rgb.g, rgb.b)
    document.getElementById('hex-input').value = this.currentColor

    this.updateColorPreview()
  }

  generateRandomColor() {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    this.currentColor = randomHex
    document.getElementById('hex-input').value = randomHex
    this.updateColorValues()
  }

  saveColor() {
    // TODO: Integrate with ColorCollection storage
    const colors = JSON.parse(localStorage.getItem('savedColors') || '[]')
    const colorData = {
      hex: this.currentColor,
      timestamp: new Date().toISOString(),
      id: Date.now()
    }
    
    colors.push(colorData)
    localStorage.setItem('savedColors', JSON.stringify(colors))
    
    alert('Color saved successfully!')
  }

  // Color conversion utilities
  hexToRgb(hex) {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
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

  hslToRgb(h, s, l) {
    let r, g, b

    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    }
  }
}
