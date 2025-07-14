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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

          <!-- HSV Input -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-2">HSV</label>
            <div class="space-y-2">
              <input type="number" id="hsv-h" class="input-field" placeholder="H" min="0" max="360">
              <input type="number" id="hsv-s" class="input-field" placeholder="S%" min="0" max="100">
              <input type="number" id="hsv-v" class="input-field" placeholder="V%" min="0" max="100">
            </div>
            <button class="btn-secondary mt-2 w-full" id="copy-hsv">
              Copy HSV
            </button>
          </div>

          <!-- CMYK Input -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-2">CMYK</label>
            <div class="space-y-2">
              <input type="number" id="cmyk-c" class="input-field" placeholder="C%" min="0" max="100">
              <input type="number" id="cmyk-m" class="input-field" placeholder="M%" min="0" max="100">
              <input type="number" id="cmyk-y" class="input-field" placeholder="Y%" min="0" max="100">
              <input type="number" id="cmyk-k" class="input-field" placeholder="K%" min="0" max="100">
            </div>
            <button class="btn-secondary mt-2 w-full" id="copy-cmyk">
              Copy CMYK
            </button>
          </div>

          <!-- LAB Input -->
          <div class="card">
            <label class="block text-sm font-medium text-gray-700 mb-2">LAB</label>
            <div class="space-y-2">
              <input type="number" id="lab-l" class="input-field" placeholder="L" min="0" max="100">
              <input type="number" id="lab-a" class="input-field" placeholder="A" min="-128" max="127">
              <input type="number" id="lab-b" class="input-field" placeholder="B" min="-128" max="127">
            </div>
            <button class="btn-secondary mt-2 w-full" id="copy-lab">
              Copy LAB
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

        <!-- Accessibility & Validation -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Color Validation -->
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Color Validation</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm">Valid HEX format:</span>
                <span id="hex-valid" class="text-sm font-medium">✅ Valid</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm">Web safe color:</span>
                <span id="web-safe" class="text-sm font-medium">✅ Yes</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm">CSS named color:</span>
                <span id="css-named" class="text-sm font-medium">❌ No</span>
              </div>
            </div>
          </div>

          <!-- Accessibility Contrast -->
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Accessibility Contrast</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Compare with:</label>
                <div class="flex space-x-2">
                  <input type="text" id="contrast-color" class="input-field flex-1 font-mono" placeholder="#ffffff" value="#ffffff">
                  <div class="w-10 h-10 border-2 border-gray-200 rounded" id="contrast-preview" style="background-color: #ffffff"></div>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm">Contrast ratio:</span>
                  <span id="contrast-ratio" class="text-sm font-medium">4.5:1</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">WCAG AA (normal):</span>
                  <span id="wcag-aa-normal" class="text-sm font-medium">✅ Pass</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">WCAG AA (large):</span>
                  <span id="wcag-aa-large" class="text-sm font-medium">✅ Pass</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">WCAG AAA:</span>
                  <span id="wcag-aaa" class="text-sm font-medium">❌ Fail</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Color Harmony</h3>
            <select id="harmony-type" class="input-field w-auto">
              <option value="complementary">Complementary</option>
              <option value="triadic">Triadic</option>
              <option value="analogous">Analogous</option>
              <option value="tetradic">Tetradic</option>
              <option value="monochromatic">Monochromatic</option>
            </select>
          </div>
          <div id="harmony-colors" class="grid grid-cols-5 gap-2 mb-4">
            <!-- Harmony colors will be inserted here -->
          </div>
          <button class="btn-secondary w-full" id="save-harmony">
            Save Harmony Palette
          </button>
        </div>
      </div>
    `

    this.setupEventListeners()
    
    // Use multiple strategies to ensure DOM is ready and values are initialized
    this.initializeColorValues()
  }

  setupEventListeners() {
    // HEX input
    const hexInput = document.getElementById('hex-input')
    hexInput.addEventListener('input', (e) => {
      this.currentColor = e.target.value
      
      // Add visual feedback for invalid hex
      if (this.isValidHex(this.currentColor)) {
        hexInput.classList.remove('border-red-500')
        hexInput.classList.add('border-green-500')
      } else {
        hexInput.classList.remove('border-green-500')
        hexInput.classList.add('border-red-500')
      }
      
      this.updateColorValues()
    })

    // RGB inputs
    const rgbR = document.getElementById('rgb-r')
    const rgbG = document.getElementById('rgb-g')
    const rgbB = document.getElementById('rgb-b')

    if (rgbR && rgbG && rgbB) {
      [rgbR, rgbG, rgbB].forEach(input => {
        input.addEventListener('input', () => {
          this.updateFromRGB()
        })
      })
    }

    // HSL inputs
    const hslH = document.getElementById('hsl-h')
    const hslS = document.getElementById('hsl-s')
    const hslL = document.getElementById('hsl-l')

    if (hslH && hslS && hslL) {
      [hslH, hslS, hslL].forEach(input => {
        input.addEventListener('input', () => {
          this.updateFromHSL()
        })
      })
    }

    // HSV inputs
    const hsvH = document.getElementById('hsv-h')
    const hsvS = document.getElementById('hsv-s')
    const hsvV = document.getElementById('hsv-v')

    if (hsvH && hsvS && hsvV) {
      [hsvH, hsvS, hsvV].forEach(input => {
        input.addEventListener('input', () => {
          this.updateFromHSV()
        })
      })
    }

    // CMYK inputs
    const cmykC = document.getElementById('cmyk-c')
    const cmykM = document.getElementById('cmyk-m')
    const cmykY = document.getElementById('cmyk-y')
    const cmykK = document.getElementById('cmyk-k')

    if (cmykC && cmykM && cmykY && cmykK) {
      [cmykC, cmykM, cmykY, cmykK].forEach(input => {
        input.addEventListener('input', () => {
          this.updateFromCMYK()
        })
      })
    }

    // LAB inputs
    const labL = document.getElementById('lab-l')
    const labA = document.getElementById('lab-a')
    const labB = document.getElementById('lab-b')

    if (labL && labA && labB) {
      [labL, labA, labB].forEach(input => {
        input.addEventListener('input', () => {
          this.updateFromLAB()
        })
      })
    }

    // Copy buttons
    document.getElementById('copy-rgb').addEventListener('click', () => {
      const r = document.getElementById('rgb-r').value
      const g = document.getElementById('rgb-g').value
      const b = document.getElementById('rgb-b').value
      navigator.clipboard.writeText(`rgb(${r}, ${g}, ${b})`)
      this.showToast('RGB copied!')
    })

    document.getElementById('copy-hsl').addEventListener('click', () => {
      const h = document.getElementById('hsl-h').value
      const s = document.getElementById('hsl-s').value
      const l = document.getElementById('hsl-l').value
      navigator.clipboard.writeText(`hsl(${h}, ${s}%, ${l}%)`)
      this.showToast('HSL copied!')
    })

    document.getElementById('copy-hsv').addEventListener('click', () => {
      const h = document.getElementById('hsv-h').value
      const s = document.getElementById('hsv-s').value
      const v = document.getElementById('hsv-v').value
      navigator.clipboard.writeText(`hsv(${h}, ${s}%, ${v}%)`)
      this.showToast('HSV copied!')
    })

    document.getElementById('copy-cmyk').addEventListener('click', () => {
      const c = document.getElementById('cmyk-c').value
      const m = document.getElementById('cmyk-m').value
      const y = document.getElementById('cmyk-y').value
      const k = document.getElementById('cmyk-k').value
      navigator.clipboard.writeText(`cmyk(${c}%, ${m}%, ${y}%, ${k}%)`)
      this.showToast('CMYK copied!')
    })

    document.getElementById('copy-lab').addEventListener('click', () => {
      const l = document.getElementById('lab-l').value
      const a = document.getElementById('lab-a').value
      const b = document.getElementById('lab-b').value
      navigator.clipboard.writeText(`lab(${l}, ${a}, ${b})`)
      this.showToast('LAB copied!')
    })

    // Action buttons
    document.getElementById('save-color').addEventListener('click', () => {
      this.saveColor()
    })

    document.getElementById('random-color').addEventListener('click', () => {
      this.generateRandomColor()
    })

    // Harmony controls
    document.getElementById('harmony-type').addEventListener('change', () => {
      this.updateHarmonyColors()
    })

    document.getElementById('save-harmony').addEventListener('click', () => {
      this.saveHarmonyPalette()
    })

    // Contrast checking
    document.getElementById('contrast-color').addEventListener('input', () => {
      this.updateAccessibilityInfo()
    })
  }

  updateColorPreview() {
    const preview = document.getElementById('color-preview')
    if (preview) {
      preview.style.backgroundColor = this.currentColor
    }
  }

  updateColorValues() {
    // Only validate for complete hex values (6 or 3 characters after #)
    const isCompleteHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(this.currentColor)
    
    if (!isCompleteHex) {
      // Still update accessibility info for validation display
      this.updateAccessibilityInfo()
      return
    }

    // Convert HEX to RGB and other formats
    const rgb = this.hexToRgb(this.currentColor)
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
    const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b)
    const cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b)
    const lab = this.rgbToLab(rgb.r, rgb.g, rgb.b)

    // Update RGB inputs
    const rgbR = document.getElementById('rgb-r')
    const rgbG = document.getElementById('rgb-g')
    const rgbB = document.getElementById('rgb-b')
    
    if (rgbR) rgbR.value = rgb.r
    if (rgbG) rgbG.value = rgb.g
    if (rgbB) rgbB.value = rgb.b

    // Update HSL inputs
    const hslH = document.getElementById('hsl-h')
    const hslS = document.getElementById('hsl-s')
    const hslL = document.getElementById('hsl-l')
    
    if (hslH) hslH.value = Math.round(hsl.h)
    if (hslS) hslS.value = Math.round(hsl.s)
    if (hslL) hslL.value = Math.round(hsl.l)

    // Update HSV inputs
    const hsvH = document.getElementById('hsv-h')
    const hsvS = document.getElementById('hsv-s')
    const hsvV = document.getElementById('hsv-v')
    
    if (hsvH) hsvH.value = Math.round(hsv.h)
    if (hsvS) hsvS.value = Math.round(hsv.s)
    if (hsvV) hsvV.value = Math.round(hsv.v)

    // Update CMYK inputs
    const cmykC = document.getElementById('cmyk-c')
    const cmykM = document.getElementById('cmyk-m')
    const cmykY = document.getElementById('cmyk-y')
    const cmykK = document.getElementById('cmyk-k')
    
    if (cmykC) cmykC.value = Math.round(cmyk.c)
    if (cmykM) cmykM.value = Math.round(cmyk.m)
    if (cmykY) cmykY.value = Math.round(cmyk.y)
    if (cmykK) cmykK.value = Math.round(cmyk.k)

    // Update LAB inputs
    const labL = document.getElementById('lab-l')
    const labA = document.getElementById('lab-a')
    const labB = document.getElementById('lab-b')
    
    if (labL) labL.value = Math.round(lab.l)
    if (labA) labA.value = Math.round(lab.a)
    if (labB) labB.value = Math.round(lab.b)

    this.updateColorPreview()
    this.updateHarmonyColors()
    this.updateAccessibilityInfo()
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

    // Update other formats
    const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b)
    const cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b)
    const lab = this.rgbToLab(rgb.r, rgb.g, rgb.b)

    document.getElementById('hsv-h').value = Math.round(hsv.h)
    document.getElementById('hsv-s').value = Math.round(hsv.s)
    document.getElementById('hsv-v').value = Math.round(hsv.v)

    document.getElementById('cmyk-c').value = Math.round(cmyk.c)
    document.getElementById('cmyk-m').value = Math.round(cmyk.m)
    document.getElementById('cmyk-y').value = Math.round(cmyk.y)
    document.getElementById('cmyk-k').value = Math.round(cmyk.k)

    document.getElementById('lab-l').value = Math.round(lab.l)
    document.getElementById('lab-a').value = Math.round(lab.a)
    document.getElementById('lab-b').value = Math.round(lab.b)

    this.updateColorPreview()
  }

  updateFromHSV() {
    const h = parseInt(document.getElementById('hsv-h').value) || 0
    const s = parseInt(document.getElementById('hsv-s').value) || 0
    const v = parseInt(document.getElementById('hsv-v').value) || 0

    const rgb = this.hsvToRgb(h / 360, s / 100, v / 100)
    this.updateAllFromRgb(rgb.r, rgb.g, rgb.b)
  }

  updateFromCMYK() {
    const c = parseInt(document.getElementById('cmyk-c').value) || 0
    const m = parseInt(document.getElementById('cmyk-m').value) || 0
    const y = parseInt(document.getElementById('cmyk-y').value) || 0
    const k = parseInt(document.getElementById('cmyk-k').value) || 0

    const rgb = this.cmykToRgb(c / 100, m / 100, y / 100, k / 100)
    this.updateAllFromRgb(rgb.r, rgb.g, rgb.b)
  }

  updateFromLAB() {
    const l = parseInt(document.getElementById('lab-l').value) || 0
    const a = parseInt(document.getElementById('lab-a').value) || 0
    const b = parseInt(document.getElementById('lab-b').value) || 0

    const rgb = this.labToRgb(l, a, b)
    this.updateAllFromRgb(rgb.r, rgb.g, rgb.b)
  }

  updateAllFromRgb(r, g, b) {
    // Update RGB inputs
    document.getElementById('rgb-r').value = r
    document.getElementById('rgb-g').value = g
    document.getElementById('rgb-b').value = b

    // Update HEX
    this.currentColor = this.rgbToHex(r, g, b)
    document.getElementById('hex-input').value = this.currentColor

    // Update other formats
    const hsl = this.rgbToHsl(r, g, b)
    const hsv = this.rgbToHsv(r, g, b)
    const cmyk = this.rgbToCmyk(r, g, b)
    const lab = this.rgbToLab(r, g, b)

    // Only update if not the source of change
    if (document.activeElement.id.indexOf('hsl') !== 0) {
      document.getElementById('hsl-h').value = Math.round(hsl.h)
      document.getElementById('hsl-s').value = Math.round(hsl.s)
      document.getElementById('hsl-l').value = Math.round(hsl.l)
    }

    if (document.activeElement.id.indexOf('hsv') !== 0) {
      document.getElementById('hsv-h').value = Math.round(hsv.h)
      document.getElementById('hsv-s').value = Math.round(hsv.s)
      document.getElementById('hsv-v').value = Math.round(hsv.v)
    }

    if (document.activeElement.id.indexOf('cmyk') !== 0) {
      document.getElementById('cmyk-c').value = Math.round(cmyk.c)
      document.getElementById('cmyk-m').value = Math.round(cmyk.m)
      document.getElementById('cmyk-y').value = Math.round(cmyk.y)
      document.getElementById('cmyk-k').value = Math.round(cmyk.k)
    }

    if (document.activeElement.id.indexOf('lab') !== 0) {
      document.getElementById('lab-l').value = Math.round(lab.l)
      document.getElementById('lab-a').value = Math.round(lab.a)
      document.getElementById('lab-b').value = Math.round(lab.b)
    }

    this.updateColorPreview()
  }

  generateRandomColor() {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    this.currentColor = randomHex
    document.getElementById('hex-input').value = randomHex
    this.updateColorValues()
  }

  saveColor() {
    const colors = JSON.parse(localStorage.getItem('savedColors') || '[]')
    const rgb = this.hexToRgb(this.currentColor)
    
    // Check if color already exists
    const existingColor = colors.find(c => c.hex.toLowerCase() === this.currentColor.toLowerCase())
    if (existingColor) {
      existingColor.lastUsed = new Date().toISOString()
      existingColor.usageCount = (existingColor.usageCount || 0) + 1
      localStorage.setItem('savedColors', JSON.stringify(colors))
      this.showToast('Color usage updated!')
      return
    }
    
    const colorData = {
      hex: this.currentColor,
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      id: Date.now(),
      tags: [],
      isFavorite: false,
      usageCount: 1
    }
    
    colors.push(colorData)
    localStorage.setItem('savedColors', JSON.stringify(colors))
    
    this.showToast('Color saved successfully!')
  }

  updateAccessibilityInfo() {
    // Update validation info
    this.updateColorValidation()
    
    // Update contrast info
    const contrastColor = document.getElementById('contrast-color').value || '#ffffff'
    const contrastPreview = document.getElementById('contrast-preview')
    contrastPreview.style.backgroundColor = contrastColor
    
    const ratio = this.calculateContrastRatio(this.currentColor, contrastColor)
    
    document.getElementById('contrast-ratio').textContent = `${ratio.toFixed(2)}:1`
    
    // WCAG compliance
    const wcagAANormal = ratio >= 4.5
    const wcagAALarge = ratio >= 3.0
    const wcagAAA = ratio >= 7.0
    
    document.getElementById('wcag-aa-normal').innerHTML = wcagAANormal ? '✅ Pass' : '❌ Fail'
    document.getElementById('wcag-aa-large').innerHTML = wcagAALarge ? '✅ Pass' : '❌ Fail'
    document.getElementById('wcag-aaa').innerHTML = wcagAAA ? '✅ Pass' : '❌ Fail'
  }

  updateColorValidation() {
    const hexValid = this.isValidHex(this.currentColor)
    const webSafe = this.isWebSafeColor(this.currentColor)
    const cssNamed = this.getCSSColorName(this.currentColor)
    
    document.getElementById('hex-valid').innerHTML = hexValid ? '✅ Valid' : '❌ Invalid'
    document.getElementById('web-safe').innerHTML = webSafe ? '✅ Yes' : '❌ No'
    document.getElementById('css-named').innerHTML = cssNamed ? `✅ ${cssNamed}` : '❌ No'
  }

  isValidHex(hex) {
    // Allow partial hex inputs while typing (at least 3 characters after #)
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex) || 
           (hex.length >= 4 && /^#[A-Fa-f0-9]+$/.test(hex))
  }

  isWebSafeColor(hex) {
    const rgb = this.hexToRgb(hex)
    const webSafeValues = [0, 51, 102, 153, 204, 255]
    return webSafeValues.includes(rgb.r) && webSafeValues.includes(rgb.g) && webSafeValues.includes(rgb.b)
  }

  getCSSColorName(hex) {
    const cssColors = {
      '#000000': 'black',
      '#ffffff': 'white',
      '#ff0000': 'red',
      '#00ff00': 'lime',
      '#0000ff': 'blue',
      '#ffff00': 'yellow',
      '#ff00ff': 'magenta',
      '#00ffff': 'cyan',
      '#800000': 'maroon',
      '#008000': 'green',
      '#000080': 'navy',
      '#808000': 'olive',
      '#800080': 'purple',
      '#008080': 'teal',
      '#c0c0c0': 'silver',
      '#808080': 'gray',
      '#ffa500': 'orange',
      '#ffc0cb': 'pink',
      '#a52a2a': 'brown',
      '#dda0dd': 'plum'
    }
    return cssColors[hex.toLowerCase()] || null
  }

  calculateContrastRatio(color1, color2) {
    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)
    
    const l1 = this.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
    const l2 = this.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)
    
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }

  getRelativeLuminance(r, g, b) {
    // Convert to 0-1 range
    r /= 255
    g /= 255
    b /= 255
    
    // Apply gamma correction
    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)
    
    // Calculate relative luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  updateHarmonyColors() {
    const harmonyType = document.getElementById('harmony-type').value
    const rgb = this.hexToRgb(this.currentColor)
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
    
    let harmonyColors = []
    
    switch (harmonyType) {
      case 'complementary':
        harmonyColors = this.generateComplementary(hsl)
        break
      case 'triadic':
        harmonyColors = this.generateTriadic(hsl)
        break
      case 'analogous':
        harmonyColors = this.generateAnalogous(hsl)
        break
      case 'tetradic':
        harmonyColors = this.generateTetradic(hsl)
        break
      case 'monochromatic':
        harmonyColors = this.generateMonochromatic(hsl)
        break
    }
    
    this.renderHarmonyColors(harmonyColors)
  }

  generateComplementary(hsl) {
    const complementaryHue = (hsl.h + 180) % 360
    return [
      this.currentColor,
      this.hslToHex(complementaryHue, hsl.s, hsl.l)
    ]
  }

  generateTriadic(hsl) {
    return [
      this.currentColor,
      this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
    ]
  }

  generateAnalogous(hsl) {
    return [
      this.hslToHex((hsl.h - 30) % 360, hsl.s, hsl.l),
      this.hslToHex((hsl.h - 15) % 360, hsl.s, hsl.l),
      this.currentColor,
      this.hslToHex((hsl.h + 15) % 360, hsl.s, hsl.l),
      this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
    ]
  }

  generateTetradic(hsl) {
    return [
      this.currentColor,
      this.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
      this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
      this.hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l)
    ]
  }

  generateMonochromatic(hsl) {
    return [
      this.hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 40)),
      this.hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 20)),
      this.currentColor,
      this.hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 20)),
      this.hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 40))
    ]
  }

  hslToHex(h, s, l) {
    const rgb = this.hslToRgb(h / 360, s / 100, l / 100)
    return this.rgbToHex(rgb.r, rgb.g, rgb.b)
  }

  renderHarmonyColors(colors) {
    const harmonyContainer = document.getElementById('harmony-colors')
    harmonyContainer.innerHTML = colors.map(color => `
      <div class="group relative">
        <div class="h-16 rounded border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
             style="background-color: ${color}"
             title="Click to copy ${color}"
             onclick="navigator.clipboard.writeText('${color}'); this.showToast('Copied ${color}')">
        </div>
        <div class="text-xs text-center mt-1 font-mono">${color}</div>
      </div>
    `).join('')
  }

  saveHarmonyPalette() {
    const harmonyType = document.getElementById('harmony-type').value
    const rgb = this.hexToRgb(this.currentColor)
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
    
    let harmonyColors = []
    
    switch (harmonyType) {
      case 'complementary':
        harmonyColors = this.generateComplementary(hsl)
        break
      case 'triadic':
        harmonyColors = this.generateTriadic(hsl)
        break
      case 'analogous':
        harmonyColors = this.generateAnalogous(hsl)
        break
      case 'tetradic':
        harmonyColors = this.generateTetradic(hsl)
        break
      case 'monochromatic':
        harmonyColors = this.generateMonochromatic(hsl)
        break
    }

    const palettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]')
    const paletteData = {
      name: `${harmonyType.charAt(0).toUpperCase() + harmonyType.slice(1)} Harmony`,
      colors: harmonyColors.map(hex => ({
        hex,
        rgb: this.hexToRgb(hex),
        timestamp: new Date().toISOString(),
        id: Date.now() + Math.random()
      })),
      timestamp: new Date().toISOString(),
      id: Date.now()
    }
    
    palettes.push(paletteData)
    localStorage.setItem('savedPalettes', JSON.stringify(palettes))
    
    this.showToast('Harmony palette saved!')
  }

  // Color conversion utilities
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
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

  rgbToHsv(r, g, b) {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    let h = 0
    const s = max === 0 ? 0 : diff / max
    const v = max

    if (diff !== 0) {
      switch (max) {
        case r: h = (g - b) / diff + (g < b ? 6 : 0); break
        case g: h = (b - r) / diff + 2; break
        case b: h = (r - g) / diff + 4; break
      }
      h /= 6
    }

    return { h: h * 360, s: s * 100, v: v * 100 }
  }

  hsvToRgb(h, s, v) {
    const c = v * s
    const x = c * (1 - Math.abs((h * 6) % 2 - 1))
    const m = v - c

    let r = 0, g = 0, b = 0

    if (h >= 0 && h < 1/6) {
      r = c; g = x; b = 0
    } else if (h >= 1/6 && h < 2/6) {
      r = x; g = c; b = 0
    } else if (h >= 2/6 && h < 3/6) {
      r = 0; g = c; b = x
    } else if (h >= 3/6 && h < 4/6) {
      r = 0; g = x; b = c
    } else if (h >= 4/6 && h < 5/6) {
      r = x; g = 0; b = c
    } else if (h >= 5/6 && h < 1) {
      r = c; g = 0; b = x
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    }
  }

  rgbToCmyk(r, g, b) {
    r /= 255
    g /= 255
    b /= 255

    const k = 1 - Math.max(r, g, b)
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k)
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k)
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k)

    return {
      c: c * 100,
      m: m * 100,
      y: y * 100,
      k: k * 100
    }
  }

  cmykToRgb(c, m, y, k) {
    const r = 255 * (1 - c) * (1 - k)
    const g = 255 * (1 - m) * (1 - k)
    const b = 255 * (1 - y) * (1 - k)

    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b)
    }
  }

  rgbToLab(r, g, b) {
    // Convert RGB to XYZ
    r /= 255
    g /= 255
    b /= 255

    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

    // Observer. = 2°, Illuminant = D65
    let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
    let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
    let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

    // Apply Lab transformation
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116)
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116)
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116)

    const l = (116 * y) - 16
    const a = 500 * (x - y)
    const b_lab = 200 * (y - z)

    return { l, a, b: b_lab }
  }

  labToRgb(l, a, b) {
    let y = (l + 16) / 116
    let x = a / 500 + y
    let z = y - b / 200

    const y3 = Math.pow(y, 3)
    const x3 = Math.pow(x, 3)
    const z3 = Math.pow(z, 3)

    y = y3 > 0.008856 ? y3 : (y - 16/116) / 7.787
    x = x3 > 0.008856 ? x3 : (x - 16/116) / 7.787
    z = z3 > 0.008856 ? z3 : (z - 16/116) / 7.787

    // Observer. = 2°, Illuminant = D65
    x *= 0.95047
    y *= 1.00000
    z *= 1.08883

    // Convert XYZ to RGB
    let r = x * 3.2406 + y * -1.5372 + z * -0.4986
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415
    let b_rgb = x * 0.0557 + y * -0.2040 + z * 1.0570

    // Apply gamma correction
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g
    b_rgb = b_rgb > 0.0031308 ? 1.055 * Math.pow(b_rgb, 1/2.4) - 0.055 : 12.92 * b_rgb

    return {
      r: Math.max(0, Math.min(255, Math.round(r * 255))),
      g: Math.max(0, Math.min(255, Math.round(g * 255))),
      b: Math.max(0, Math.min(255, Math.round(b_rgb * 255)))
    }
  }

  showToast(message) {
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-up'
    toast.textContent = message
    
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.remove()
    }, 2000)
  }

  initializeColorValues() {
    // Try multiple strategies to ensure initialization works
    const attemptInitialization = () => {
      // Check if all required DOM elements exist
      const hexInput = document.getElementById('hex-input')
      const rgbR = document.getElementById('rgb-r')
      const rgbG = document.getElementById('rgb-g')
      const rgbB = document.getElementById('rgb-b')
      
      if (hexInput && rgbR && rgbG && rgbB) {
        // All elements exist, proceed with initialization
        this.updateColorValues()
        this.updateHarmonyColors()
        this.updateAccessibilityInfo()
        return true
      }
      return false
    }

    // Try immediately
    if (attemptInitialization()) {
      return
    }

    // Try with requestAnimationFrame
    requestAnimationFrame(() => {
      if (attemptInitialization()) {
        return
      }

      // Try with a small timeout as fallback
      setTimeout(() => {
        attemptInitialization()
      }, 10)
    })
  }
}
