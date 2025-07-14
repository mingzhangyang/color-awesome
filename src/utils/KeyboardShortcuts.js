/**
 * Keyboard Shortcuts Manager for Color Awesome
 * Handles global keyboard shortcuts and accessibility
 */

export class KeyboardShortcuts {
  constructor(app) {
    this.app = app
    this.shortcuts = new Map()
    this.setupShortcuts()
    this.init()
  }

  setupShortcuts() {
    // Navigation shortcuts
    this.shortcuts.set('1', () => this.app.switchView('converter'))
    this.shortcuts.set('2', () => this.app.switchView('picker'))
    this.shortcuts.set('3', () => this.app.switchView('collection'))
    
    // Utility shortcuts
    this.shortcuts.set('ctrl+k', () => this.showCommandPalette())
    this.shortcuts.set('ctrl+/', () => this.showShortcutsHelp())
    this.shortcuts.set('escape', () => this.handleEscape())
    
    // Color conversion shortcuts
    this.shortcuts.set('ctrl+c', () => this.copyCurrentColor())
    this.shortcuts.set('ctrl+v', () => this.pasteColor())
    this.shortcuts.set('ctrl+s', () => this.saveCurrentColor())
    
    // Collection shortcuts
    this.shortcuts.set('ctrl+f', () => this.focusSearch())
    this.shortcuts.set('ctrl+shift+f', () => this.toggleFavorites())
  }

  init() {
    document.addEventListener('keydown', (e) => this.handleKeydown(e))
    this.setupAccessibilityAttributes()
  }

  handleKeydown(e) {
    const key = this.getKeyString(e)
    
    // Don't trigger shortcuts when typing in inputs
    if (e.target.matches('input, textarea, [contenteditable]')) {
      // Only allow escape and some ctrl shortcuts
      if (key !== 'escape' && !key.startsWith('ctrl+')) return
    }

    const shortcut = this.shortcuts.get(key)
    if (shortcut) {
      e.preventDefault()
      shortcut()
    }
  }

  getKeyString(e) {
    let key = e.key.toLowerCase()
    const modifiers = []
    
    if (e.ctrlKey) modifiers.push('ctrl')
    if (e.shiftKey) modifiers.push('shift')
    if (e.altKey) modifiers.push('alt')
    if (e.metaKey) modifiers.push('meta')
    
    return modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key
  }

  showCommandPalette() {
    // Create or show command palette modal
    const existing = document.querySelector('#command-palette')
    if (existing) {
      existing.classList.remove('hidden')
      existing.querySelector('input').focus()
      return
    }

    const palette = document.createElement('div')
    palette.id = 'command-palette'
    palette.className = 'fixed inset-0 z-50 flex items-start justify-center pt-16 px-4'
    palette.innerHTML = `
      <div class="fixed inset-0 bg-black/50 animate-fade-in" onclick="this.parentElement.remove()"></div>
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full animate-scale-in">
        <div class="p-4">
          <input 
            type="text" 
            placeholder="Type a command..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autofocus
          />
          <div class="mt-4 space-y-2" id="command-results">
            <div class="text-sm text-gray-600">Quick actions:</div>
            <div class="command-item p-2 hover:bg-gray-100 rounded cursor-pointer" data-action="converter">
              <span class="font-medium">Color Converter</span>
              <span class="text-gray-500 ml-2">Press 1</span>
            </div>
            <div class="command-item p-2 hover:bg-gray-100 rounded cursor-pointer" data-action="picker">
              <span class="font-medium">Image Color Picker</span>
              <span class="text-gray-500 ml-2">Press 2</span>
            </div>
            <div class="command-item p-2 hover:bg-gray-100 rounded cursor-pointer" data-action="collection">
              <span class="font-medium">Color Collection</span>
              <span class="text-gray-500 ml-2">Press 3</span>
            </div>
          </div>
        </div>
      </div>
    `
    
    document.body.appendChild(palette)
    
    // Handle command selection
    palette.addEventListener('click', (e) => {
      const item = e.target.closest('.command-item')
      if (item) {
        const action = item.dataset.action
        this.app.switchView(action)
        palette.remove()
      }
    })

    // Handle escape to close
    palette.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        palette.remove()
      }
    })
  }

  showShortcutsHelp() {
    const existing = document.querySelector('#shortcuts-help')
    if (existing) {
      existing.classList.remove('hidden')
      return
    }

    const help = document.createElement('div')
    help.id = 'shortcuts-help'
    help.className = 'fixed inset-0 z-50 flex items-center justify-center px-4'
    help.innerHTML = `
      <div class="fixed inset-0 bg-black/50 animate-fade-in" onclick="this.parentElement.remove()"></div>
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full animate-scale-in max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold">Keyboard Shortcuts</h2>
            <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('#shortcuts-help').remove()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="grid gap-6">
            <div>
              <h3 class="font-semibold mb-3 text-gray-800">Navigation</h3>
              <div class="space-y-2">
                ${this.createShortcutItem('1', 'Color Converter')}
                ${this.createShortcutItem('2', 'Image Color Picker')}
                ${this.createShortcutItem('3', 'Color Collection')}
              </div>
            </div>
            
            <div>
              <h3 class="font-semibold mb-3 text-gray-800">General</h3>
              <div class="space-y-2">
                ${this.createShortcutItem('Ctrl+K', 'Command Palette')}
                ${this.createShortcutItem('Ctrl+/', 'Show Shortcuts')}
                ${this.createShortcutItem('Esc', 'Close Modal/Cancel')}
              </div>
            </div>
            
            <div>
              <h3 class="font-semibold mb-3 text-gray-800">Color Actions</h3>
              <div class="space-y-2">
                ${this.createShortcutItem('Ctrl+C', 'Copy Current Color')}
                ${this.createShortcutItem('Ctrl+V', 'Paste Color')}
                ${this.createShortcutItem('Ctrl+S', 'Save Current Color')}
              </div>
            </div>
            
            <div>
              <h3 class="font-semibold mb-3 text-gray-800">Collection</h3>
              <div class="space-y-2">
                ${this.createShortcutItem('Ctrl+F', 'Focus Search')}
                ${this.createShortcutItem('Ctrl+Shift+F', 'Toggle Favorites')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    
    document.body.appendChild(help)
  }

  createShortcutItem(shortcut, description) {
    return `
      <div class="flex justify-between items-center py-1">
        <span class="text-gray-700">${description}</span>
        <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">${shortcut}</kbd>
      </div>
    `
  }

  handleEscape() {
    // Close any open modals or cancel current actions
    const modals = document.querySelectorAll('[id$="-palette"], [id$="-help"], .modal, [data-modal]')
    modals.forEach(modal => modal.remove())
    
    // Reset any active states
    const activeElements = document.querySelectorAll('.organizing-mode, .eyedropper-active')
    activeElements.forEach(el => el.classList.remove('organizing-mode', 'eyedropper-active'))
  }

  copyCurrentColor() {
    // Try to find and copy the current color being displayed
    const colorDisplay = document.querySelector('.color-preview, .current-color, [data-color]')
    if (colorDisplay) {
      const color = colorDisplay.style.backgroundColor || colorDisplay.dataset.color
      if (color) {
        navigator.clipboard.writeText(color).then(() => {
          this.showToast('Color copied to clipboard!')
        })
      }
    }
  }

  pasteColor() {
    navigator.clipboard.readText().then(text => {
      // Try to parse the pasted text as a color
      if (this.isValidColor(text)) {
        // Find color input and set the value
        const colorInput = document.querySelector('input[type="color"], input[name*="color"]')
        if (colorInput) {
          colorInput.value = text
          colorInput.dispatchEvent(new Event('input', { bubbles: true }))
          this.showToast('Color pasted!')
        }
      }
    }).catch(() => {
      this.showToast('Could not paste color', 'error')
    })
  }

  saveCurrentColor() {
    // Trigger save action if available
    const saveButton = document.querySelector('[data-action="save"], .save-color, button[onclick*="save"]')
    if (saveButton) {
      saveButton.click()
    }
  }

  focusSearch() {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"], .search-input')
    if (searchInput) {
      searchInput.focus()
      searchInput.select()
    }
  }

  toggleFavorites() {
    const favoritesButton = document.querySelector('[data-filter="favorites"], .favorites-filter')
    if (favoritesButton) {
      favoritesButton.click()
    }
  }

  setupAccessibilityAttributes() {
    // Add ARIA labels and roles to common elements
    setTimeout(() => {
      this.enhanceAccessibility()
    }, 100)
  }

  enhanceAccessibility() {
    // Add skip links
    if (!document.querySelector('.skip-link')) {
      const skipLink = document.createElement('a')
      skipLink.href = '#main-content'
      skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded z-50'
      skipLink.textContent = 'Skip to main content'
      document.body.insertBefore(skipLink, document.body.firstChild)
    }

    // Enhance buttons without proper labels
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
    buttons.forEach(button => {
      if (!button.textContent.trim()) {
        const icon = button.querySelector('svg, i, .icon')
        if (icon) {
          button.setAttribute('aria-label', this.getButtonAriaLabel(button))
        }
      }
    })

    // Enhance color swatches
    const colorSwatches = document.querySelectorAll('.color-swatch, [data-color]')
    colorSwatches.forEach(swatch => {
      if (!swatch.getAttribute('aria-label')) {
        const color = swatch.dataset.color || swatch.style.backgroundColor
        swatch.setAttribute('aria-label', `Color: ${color}`)
        swatch.setAttribute('role', 'button')
        swatch.setAttribute('tabindex', '0')
      }
    })
  }

  getButtonAriaLabel(button) {
    const className = button.className
    if (className.includes('copy')) return 'Copy color'
    if (className.includes('save')) return 'Save color'
    if (className.includes('delete')) return 'Delete color'
    if (className.includes('edit')) return 'Edit color'
    if (className.includes('close')) return 'Close'
    if (className.includes('menu')) return 'Open menu'
    return 'Button'
  }

  isValidColor(color) {
    const style = new Option().style
    style.color = color
    return style.color !== ''
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div')
    toast.className = `fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg text-white animate-slide-up ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    }`
    toast.textContent = message
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.classList.add('animate-fade-out')
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }
}
