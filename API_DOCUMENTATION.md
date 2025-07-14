# Color Awesome - API Documentation

This document provides technical documentation for the Color Awesome application architecture, APIs, and integration points.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core APIs](#core-apis)
- [Component APIs](#component-apis)
- [Utility APIs](#utility-apis)
- [Event System](#event-system)
- [Storage APIs](#storage-apis)
- [Performance APIs](#performance-apis)
- [Extension Points](#extension-points)

## 🏗️ Architecture Overview

Color Awesome follows a modular, component-based architecture with clear separation of concerns.

```
src/
├── components/          # UI Components
│   ├── ColorConverter.js
│   ├── ImageColorPicker.js
│   ├── ColorCollection.js
│   ├── Navigation.js
│   └── MobileNavigation.js
├── utils/              # Utility Classes
│   ├── KeyboardShortcuts.js
│   ├── UIEnhancements.js
│   └── PerformanceOptimizer.js
├── App.js              # Main Application
├── main.js             # Entry Point
└── style.css           # Global Styles
```

## 🔧 Core APIs

### Color Conversion API

#### `ColorUtils`

Core color conversion utilities with support for 6 color formats.

```javascript
import { ColorUtils } from './utils/ColorUtils.js'

// Hex conversions
const rgb = ColorUtils.hexToRgb('#FF0000')
// Returns: { r: 255, g: 0, b: 0 }

const hex = ColorUtils.rgbToHex(255, 0, 0)
// Returns: '#ff0000'

// HSL conversions
const hsl = ColorUtils.rgbToHsl(255, 0, 0)
// Returns: { h: 0, s: 100, l: 50 }

const rgb2 = ColorUtils.hslToRgb(0, 100, 50)
// Returns: { r: 255, g: 0, b: 0 }

// HSV conversions
const hsv = ColorUtils.rgbToHsv(255, 0, 0)
// Returns: { h: 0, s: 100, v: 100 }

// CMYK conversions
const cmyk = ColorUtils.rgbToCmyk(255, 0, 0)
// Returns: { c: 0, m: 100, y: 100, k: 0 }

// LAB conversions
const lab = ColorUtils.rgbToLab(255, 0, 0)
// Returns: { l: 53.24, a: 80.09, b: 67.20 }
```

#### Validation Methods

```javascript
// Validate color formats
ColorUtils.isValidHex('#FF0000')        // true
ColorUtils.isValidRgb(255, 0, 0)        // true
ColorUtils.isValidHsl(0, 100, 50)       // true

// Normalize colors
ColorUtils.normalizeHex('#f00')         // '#ff0000'
ColorUtils.clampRgb(300, -10, 128)      // { r: 255, g: 0, b: 128 }
```

#### Accessibility Methods

```javascript
// Calculate contrast ratio
const ratio = ColorUtils.getContrastRatio(
  { r: 255, g: 255, b: 255 },  // white
  { r: 0, g: 0, b: 0 }         // black
)
// Returns: 21 (maximum contrast)

// Check WCAG compliance
const isAA = ColorUtils.isWCAGCompliant(ratio, 'AA')     // true
const isAAA = ColorUtils.isWCAGCompliant(ratio, 'AAA')   // true

// Get luminance
const luminance = ColorUtils.getLuminance(255, 255, 255) // 1.0
```

### Color Harmony API

```javascript
// Generate color harmonies
const complementary = ColorUtils.getComplementary('#FF0000')
// Returns: '#00FFFF'

const triadic = ColorUtils.getTriadic('#FF0000')
// Returns: ['#FF0000', '#00FF00', '#0000FF']

const analogous = ColorUtils.getAnalogous('#FF0000', 5)
// Returns: Array of 5 analogous colors

const monochromatic = ColorUtils.getMonochromatic('#FF0000', 5)
// Returns: Array of 5 monochromatic variations
```

## 🎨 Component APIs

### ColorConverter Component

```javascript
import { ColorConverter } from './components/ColorConverter.js'

const converter = new ColorConverter({
  initialColor: '#3b82f6',
  onColorChange: (color) => console.log('Color changed:', color),
  enableHarmony: true,
  enableAccessibility: true
})

// Render to container
converter.render(document.getElementById('converter-container'))

// Methods
converter.setColor('#FF0000')           // Set color programmatically
converter.getColor()                    // Get current color object
converter.generateHarmony('triadic')    // Generate color harmony
converter.checkAccessibility(bgColor)  // Check contrast with background
```

### ImageColorPicker Component

```javascript
import { ImageColorPicker } from './components/ImageColorPicker.js'

const picker = new ImageColorPicker({
  maxImageSize: 2048,
  enableZoom: true,
  enableEyedropper: true,
  onColorPicked: (color, coordinates) => {
    console.log('Picked color:', color, 'at:', coordinates)
  }
})

// Methods
picker.loadImage(file)                  // Load image file
picker.extractDominantColors(count)     // Extract dominant colors
picker.generatePalette(size)            // Generate color palette
picker.setZoom(level)                   // Set zoom level
picker.enableEyedropper(enabled)        // Toggle eyedropper mode
```

### ColorCollection Component

```javascript
import { ColorCollection } from './components/ColorCollection.js'

const collection = new ColorCollection({
  enableFavorites: true,
  enableTags: true,
  enableDragDrop: true,
  onColorSelect: (color) => console.log('Selected:', color)
})

// Methods
collection.addColor(colorObject)        // Add color to collection
collection.removeColor(colorId)         // Remove color
collection.updateColor(colorId, data)   // Update color data
collection.getColors()                  // Get all colors
collection.filterColors(criteria)       // Filter colors
collection.sortColors(method)           // Sort colors
collection.exportCollection(format)     // Export collection
```

## 🛠️ Utility APIs

### KeyboardShortcuts

```javascript
import { KeyboardShortcuts } from './utils/KeyboardShortcuts.js'

const shortcuts = new KeyboardShortcuts(app)

// Add custom shortcuts
shortcuts.addShortcut('ctrl+shift+c', () => {
  // Custom action
})

// Remove shortcuts
shortcuts.removeShortcut('ctrl+shift+c')

// Show command palette
shortcuts.showCommandPalette()

// Show help
shortcuts.showShortcutsHelp()
```

### UIEnhancements

```javascript
import { UIEnhancements } from './utils/UIEnhancements.js'

const ui = new UIEnhancements()

// Loading states
ui.setLoading(element, true, 'Processing...')
ui.setSkeletonLoading(element, true)

// Progress tracking
ui.showProgressBar(container, 75)

// Notifications
ui.showToast('Success message', 'success', 3000)
ui.showToast('Error message', 'error')

// Animations
ui.animateCounter(element, 0, 100, 1000)
ui.transitionToView(fromElement, toElement, 'left')

// Performance
ui.batchDOMUpdates([
  () => element1.textContent = 'New text',
  () => element2.style.color = 'red'
])
```

### PerformanceOptimizer

```javascript
import { PerformanceOptimizer } from './utils/PerformanceOptimizer.js'

const optimizer = new PerformanceOptimizer()

// Image optimization
const optimized = await optimizer.optimizeImage(file, 1024, 1024, 0.8)

// Virtual scrolling
optimizer.createVirtualList(container, items, 60, renderItem)

// Lazy loading
optimizer.observeLazyElement(element)

// Performance measurement
const result = optimizer.measurePerformance('colorConversion', () => {
  return ColorUtils.hexToRgb('#FF0000')
})

// Get insights
const insights = optimizer.getPerformanceInsights()
```

## 📡 Event System

Color Awesome uses a custom event system for component communication.

### Event Types

```javascript
// Color events
'color:changed'     // Color value changed
'color:saved'       // Color saved to collection
'color:copied'      // Color copied to clipboard

// Image events
'image:loaded'      // Image loaded successfully
'image:error'       // Image loading error
'color:picked'      // Color picked from image

// Collection events
'collection:updated'    // Collection modified
'collection:filtered'   // Filter applied
'collection:sorted'     // Sort applied

// UI events
'view:changed'      // Navigation between views
'modal:opened'      // Modal opened
'modal:closed'      // Modal closed
```

### Event Usage

```javascript
// Listen to events
document.addEventListener('color:changed', (event) => {
  console.log('New color:', event.detail.color)
})

// Dispatch events
document.dispatchEvent(new CustomEvent('color:saved', {
  detail: { color: colorObject, timestamp: Date.now() }
}))
```

## 💾 Storage APIs

### LocalStorage Manager

```javascript
import { StorageManager } from './utils/StorageManager.js'

const storage = new StorageManager('colorAwesome')

// Basic operations
storage.setItem('colors', colorsArray)
storage.getItem('colors')
storage.removeItem('colors')
storage.clear()

// Advanced operations
storage.setWithExpiry('temp_data', data, 3600000) // 1 hour
storage.getWithDefault('settings', defaultSettings)
storage.backup('colors')
storage.restore('colors', backupData)

// Data migration
storage.migrate('1.0.0', '1.1.0', migrationFunction)
```

### Collection Storage

```javascript
// Color object structure
const colorObject = {
  id: 'unique-id',
  hex: '#FF0000',
  rgb: { r: 255, g: 0, b: 0 },
  hsl: { h: 0, s: 100, l: 50 },
  name: 'Red',
  tags: ['primary', 'brand'],
  isFavorite: false,
  createdAt: 1634567890000,
  updatedAt: 1634567890000,
  usageCount: 5,
  source: 'converter', // 'converter', 'picker', 'import'
  metadata: {
    // Additional custom data
  }
}
```

## ⚡ Performance APIs

### Performance Monitoring

```javascript
// Core Web Vitals
const vitals = PerformanceOptimizer.getCoreWebVitals()
// Returns: { LCP, FID, CLS, FCP, TTFB }

// Custom metrics
PerformanceOptimizer.measureUserTiming('color-conversion', () => {
  // Color conversion code
})

// Memory usage
const memory = PerformanceOptimizer.getMemoryUsage()
// Returns: { used, total, percentage }
```

### Optimization Utilities

```javascript
// Debounce expensive operations
const debouncedSearch = PerformanceOptimizer.debounce(searchFunction, 300)

// Throttle frequent events
const throttledScroll = PerformanceOptimizer.throttle(scrollHandler, 16)

// Canvas optimization
const canvas = PerformanceOptimizer.getOptimizedCanvas(800, 600)
// Use canvas...
PerformanceOptimizer.releaseCanvas(canvas)
```

## 🔌 Extension Points

### Custom Color Formats

```javascript
// Register custom color format
ColorUtils.registerFormat('XYZ', {
  fromRgb: (r, g, b) => {
    // Convert RGB to XYZ
    return { x, y, z }
  },
  toRgb: (x, y, z) => {
    // Convert XYZ to RGB
    return { r, g, b }
  },
  validate: (x, y, z) => {
    // Validate XYZ values
    return isValid
  }
})
```

### Custom Themes

```javascript
// Register custom theme
UIEnhancements.registerTheme('dark', {
  colors: {
    primary: '#3b82f6',
    background: '#1f2937',
    text: '#f9fafb'
  },
  styles: {
    // CSS custom properties
  }
})
```

### Plugin System

```javascript
// Register plugin
App.registerPlugin('customPlugin', {
  name: 'Custom Plugin',
  version: '1.0.0',
  init: (app) => {
    // Plugin initialization
  },
  destroy: () => {
    // Plugin cleanup
  }
})
```

## 🧪 Testing APIs

### Test Utilities

```javascript
import { TestUtils } from './tests/utils/TestUtils.js'

// Mock components
const mockConverter = TestUtils.createMockComponent('ColorConverter')

// Mock events
const mockEvent = TestUtils.createMockEvent('click', { bubbles: true })

// Wait for conditions
await TestUtils.waitFor(() => element.classList.contains('loaded'))

// Performance testing
const benchmark = TestUtils.benchmark(() => {
  // Code to benchmark
})
```

## 📊 Analytics APIs

### Usage Tracking

```javascript
import { Analytics } from './utils/Analytics.js'

// Track feature usage
Analytics.track('color_converted', {
  fromFormat: 'hex',
  toFormat: 'rgb',
  timestamp: Date.now()
})

// Track user interactions
Analytics.trackInteraction('button_click', {
  component: 'ColorConverter',
  action: 'copy_color'
})

// Get usage statistics
const stats = Analytics.getUsageStats()
```

## 🔒 Security APIs

### Input Sanitization

```javascript
import { Security } from './utils/Security.js'

// Sanitize user input
const safe = Security.sanitizeInput(userInput)

// Validate file uploads
const isValid = Security.validateFileUpload(file, {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['image/jpeg', 'image/png']
})
```

## 🌐 Internationalization APIs

### i18n Support

```javascript
import { i18n } from './utils/i18n.js'

// Set language
i18n.setLanguage('es')

// Get translations
const text = i18n.t('color.converter.title')

// Format numbers
const formatted = i18n.formatNumber(123.45)

// Register translations
i18n.addTranslations('fr', {
  'color.converter.title': 'Convertisseur de couleurs'
})
```

---

## 📝 API Response Formats

### Color Object

```json
{
  "hex": "#3b82f6",
  "rgb": { "r": 59, "g": 130, "b": 246 },
  "hsl": { "h": 217, "s": 91, "l": 60 },
  "hsv": { "h": 217, "s": 76, "v": 96 },
  "cmyk": { "c": 76, "m": 47, "y": 0, "k": 4 },
  "lab": { "l": 56.89, "a": 3.74, "b": -67.89 }
}
```

### Collection Export Format

```json
{
  "version": "1.5.0",
  "exportDate": "2025-07-14T12:00:00.000Z",
  "totalColors": 25,
  "colors": [
    {
      "id": "color-1",
      "hex": "#ff0000",
      "name": "Brand Red",
      "tags": ["brand", "primary"],
      "isFavorite": true,
      "createdAt": 1634567890000,
      "usageCount": 15
    }
  ]
}
```

---

**API Version**: 1.5.0  
**Documentation Version**: July 2025  
**Compatibility**: ES2020+, Modern Browsers
