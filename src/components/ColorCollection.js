export class ColorCollection {
  constructor() {
    this.savedColors = []
    this.savedPalettes = []
    this.currentView = 'colors' // 'colors' or 'palettes'
  }

  render(container) {
    this.loadData()
    
    container.innerHTML = `
      <div class="space-y-8">
        <!-- Hero Section -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">My Color Collection</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Manage your saved colors and palettes. Organize, search, and export your color collections.
          </p>
        </div>

        <!-- View Toggle -->
        <div class="flex justify-center">
          <div class="bg-gray-100 p-1 rounded-lg">
            <button class="view-toggle px-4 py-2 rounded-md transition-colors ${this.currentView === 'colors' ? 'bg-white shadow-sm' : ''}" 
                    data-view="colors">
              🎨 Individual Colors (${this.savedColors.length})
            </button>
            <button class="view-toggle px-4 py-2 rounded-md transition-colors ${this.currentView === 'palettes' ? 'bg-white shadow-sm' : ''}" 
                    data-view="palettes">
              🎭 Color Palettes (${this.savedPalettes.length})
            </button>
          </div>
        </div>

        <!-- Search and Actions -->
        <div class="card">
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div class="flex-1 max-w-md">
              <input type="text" 
                     id="search-input" 
                     class="input-field" 
                     placeholder="Search colors or palettes...">
            </div>
            <div class="flex space-x-2">
              <button class="btn-secondary" id="import-data">📁 Import</button>
              <button class="btn-secondary" id="export-data">💾 Export</button>
              <button class="btn-primary" id="clear-all">🗑️ Clear All</button>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div id="collection-content">
          <!-- Content will be inserted here based on current view -->
        </div>

        <!-- Empty State -->
        <div id="empty-state" class="hidden text-center py-12">
          <div class="max-w-md mx-auto">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🎨</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No colors saved yet</h3>
            <p class="text-gray-600 mb-4">Start building your color collection by saving colors from the converter or image picker.</p>
            <button class="btn-primary" onclick="document.querySelector('[data-view=converter]').click()">
              Start Converting Colors
            </button>
          </div>
        </div>
      </div>
    `

    this.setupEventListeners()
    this.renderContent()
  }

  setupEventListeners() {
    // View toggle
    document.querySelectorAll('.view-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentView = e.target.getAttribute('data-view')
        this.render(document.getElementById('main-content'))
      })
    })

    // Search
    document.getElementById('search-input').addEventListener('input', (e) => {
      this.filterContent(e.target.value)
    })

    // Actions
    document.getElementById('import-data').addEventListener('click', () => {
      this.importData()
    })

    document.getElementById('export-data').addEventListener('click', () => {
      this.exportData()
    })

    document.getElementById('clear-all').addEventListener('click', () => {
      this.clearAll()
    })
  }

  loadData() {
    this.savedColors = JSON.parse(localStorage.getItem('savedColors') || '[]')
    this.savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]')
  }

  renderContent() {
    const contentArea = document.getElementById('collection-content')
    const emptyState = document.getElementById('empty-state')

    if (this.currentView === 'colors') {
      if (this.savedColors.length === 0) {
        contentArea.innerHTML = ''
        emptyState.classList.remove('hidden')
      } else {
        emptyState.classList.add('hidden')
        this.renderColors(contentArea)
      }
    } else {
      if (this.savedPalettes.length === 0) {
        contentArea.innerHTML = `
          <div class="text-center py-12">
            <div class="max-w-md mx-auto">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">🎭</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No palettes saved yet</h3>
              <p class="text-gray-600 mb-4">Create color palettes by extracting colors from images.</p>
              <button class="btn-primary" onclick="document.querySelector('[data-view=image-picker]').click()">
                Pick Colors from Images
              </button>
            </div>
          </div>
        `
      } else {
        this.renderPalettes(contentArea)
      }
    }
  }

  renderColors(container) {
    container.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4" id="colors-grid">
        ${this.savedColors.map(color => `
          <div class="color-item group relative" data-color="${color.hex}" data-id="${color.id}">
            <div class="aspect-square rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-all hover:scale-105"
                 style="background-color: ${color.hex}"
                 title="Click to copy ${color.hex}">
            </div>
            <div class="text-xs text-center mt-1 font-mono">${color.hex}</div>
            <div class="text-xs text-center text-gray-500">${new Date(color.timestamp).toLocaleDateString()}</div>
            
            <!-- Actions -->
            <div class="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm hover:bg-gray-100"
                      onclick="navigator.clipboard.writeText('${color.hex}')" title="Copy">
                📋
              </button>
              <button class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm hover:bg-gray-100"
                      onclick="this.closest('.color-item').remove(); this.deleteColor('${color.id}')" title="Delete">
                🗑️
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `

    this.setupColorActions()
  }

  renderPalettes(container) {
    container.innerHTML = `
      <div class="space-y-6" id="palettes-grid">
        ${this.savedPalettes.map(palette => `
          <div class="card palette-item" data-id="${palette.id}">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-semibold text-lg">${palette.name}</h3>
                <p class="text-sm text-gray-600">${palette.colors.length} colors • ${new Date(palette.timestamp).toLocaleDateString()}</p>
              </div>
              <div class="flex space-x-2">
                <button class="text-gray-400 hover:text-gray-600" onclick="this.copyPalette('${palette.id}')" title="Copy all colors">
                  📋
                </button>
                <button class="text-gray-400 hover:text-red-600" onclick="this.deletePalette('${palette.id}')" title="Delete palette">
                  🗑️
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              ${palette.colors.map(color => `
                <div class="aspect-square rounded border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
                     style="background-color: ${color.hex}"
                     title="${color.hex}"
                     onclick="navigator.clipboard.writeText('${color.hex}')">
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  setupColorActions() {
    // Add click to copy functionality
    document.querySelectorAll('.color-item').forEach(item => {
      const colorDiv = item.querySelector('div[style]')
      colorDiv.addEventListener('click', () => {
        const hex = item.getAttribute('data-color')
        navigator.clipboard.writeText(hex)
        this.showToast(`Copied ${hex}`)
      })
    })
  }

  filterContent(searchTerm) {
    const items = document.querySelectorAll(this.currentView === 'colors' ? '.color-item' : '.palette-item')
    
    items.forEach(item => {
      const text = item.textContent.toLowerCase()
      const matches = text.includes(searchTerm.toLowerCase())
      item.style.display = matches ? 'block' : 'none'
    })
  }

  deleteColor(colorId) {
    this.savedColors = this.savedColors.filter(color => color.id != colorId)
    localStorage.setItem('savedColors', JSON.stringify(this.savedColors))
    this.renderContent()
  }

  deletePalette(paletteId) {
    if (confirm('Are you sure you want to delete this palette?')) {
      this.savedPalettes = this.savedPalettes.filter(palette => palette.id != paletteId)
      localStorage.setItem('savedPalettes', JSON.stringify(this.savedPalettes))
      this.renderContent()
    }
  }

  copyPalette(paletteId) {
    const palette = this.savedPalettes.find(p => p.id == paletteId)
    if (palette) {
      const colors = palette.colors.map(c => c.hex).join(', ')
      navigator.clipboard.writeText(colors)
      this.showToast('Palette colors copied!')
    }
  }

  importData() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result)
            
            if (data.colors) {
              this.savedColors = [...this.savedColors, ...data.colors]
              localStorage.setItem('savedColors', JSON.stringify(this.savedColors))
            }
            
            if (data.palettes) {
              this.savedPalettes = [...this.savedPalettes, ...data.palettes]
              localStorage.setItem('savedPalettes', JSON.stringify(this.savedPalettes))
            }
            
            this.render(document.getElementById('main-content'))
            this.showToast('Data imported successfully!')
          } catch (error) {
            alert('Invalid file format!')
          }
        }
        reader.readAsText(file)
      }
    }
    
    input.click()
  }

  exportData() {
    const data = {
      colors: this.savedColors,
      palettes: this.savedPalettes,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `color-awesome-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    
    URL.revokeObjectURL(url)
    this.showToast('Data exported successfully!')
  }

  clearAll() {
    const confirmMessage = this.currentView === 'colors' 
      ? 'Are you sure you want to delete all saved colors?' 
      : 'Are you sure you want to delete all saved palettes?'
    
    if (confirm(confirmMessage)) {
      if (this.currentView === 'colors') {
        this.savedColors = []
        localStorage.setItem('savedColors', JSON.stringify([]))
      } else {
        this.savedPalettes = []
        localStorage.setItem('savedPalettes', JSON.stringify([]))
      }
      
      this.renderContent()
      this.showToast('All data cleared!')
    }
  }

  showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    toast.textContent = message
    
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.remove()
    }, 3000)
  }
}
