export class ColorCollection {
  constructor() {
    this.savedColors = []
    this.savedPalettes = []
    this.currentView = 'colors' // 'colors' or 'palettes'
    this.currentVersion = '1.3.0'
    this.currentFilter = 'all'
    this.currentSort = 'newest'
    this.favoriteColors = new Set()
    this.colorTags = new Map()
    this.container = null
    this.searchQuery = ''
    this.selectedColorIds = new Set()
    this.isDragMode = false
    
    // Initialize data migration
    this.migrateDataIfNeeded()
  }

  // Helper method to get elements within this container
  getElement(id) {
    return this.container ? this.container.querySelector(`#${id}`) : null
  }
}

  migrateDataIfNeeded() {
    const currentVersion = localStorage.getItem('colorAwesome_version') || '1.0.0'
    
    if (this.versionCompare(currentVersion, this.currentVersion) < 0) {
      console.log(`Migrating data from ${currentVersion} to ${this.currentVersion}`)
      this.performDataMigration(currentVersion)
      localStorage.setItem('colorAwesome_version', this.currentVersion)
    }
  }

  versionCompare(a, b) {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0
      const bPart = bParts[i] || 0
      
      if (aPart > bPart) return 1
      if (aPart < bPart) return -1
    }
    return 0
  }

  performDataMigration(fromVersion) {
    // Migration from 1.0.0 to 1.3.0
    if (this.versionCompare(fromVersion, '1.3.0') < 0) {
      // Add missing properties to existing colors
      const colors = JSON.parse(localStorage.getItem('savedColors') || '[]')
      const updatedColors = colors.map(color => ({
        ...color,
        tags: color.tags || [],
        isFavorite: color.isFavorite || false,
        createdAt: color.timestamp || new Date().toISOString(),
        lastUsed: color.lastUsed || color.timestamp || new Date().toISOString()
      }))
      
      localStorage.setItem('savedColors', JSON.stringify(updatedColors))
      
      // Add missing properties to existing palettes
      const palettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]')
      const updatedPalettes = palettes.map(palette => ({
        ...palette,
        tags: palette.tags || [],
        isFavorite: palette.isFavorite || false,
        createdAt: palette.timestamp || new Date().toISOString(),
        lastUsed: palette.lastUsed || palette.timestamp || new Date().toISOString()
      }))
      
      localStorage.setItem('savedPalettes', JSON.stringify(updatedPalettes))
    }
  }

  render(container) {
    this.container = container
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
          <div class="flex flex-col gap-4">
            <!-- Search and Filter Row -->
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
            
            <!-- Filter and Organization Row -->
            <div class="flex flex-col sm:flex-row gap-4 items-center justify-between border-t pt-4">
              <div class="flex flex-wrap gap-2">
                <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                  All
                </button>
                <button class="filter-btn ${this.currentFilter === 'favorites' ? 'active' : ''}" data-filter="favorites">
                  ⭐ Favorites
                </button>
                <button class="filter-btn ${this.currentFilter === 'recent' ? 'active' : ''}" data-filter="recent">
                  🕒 Recent
                </button>
                <select id="tag-filter" class="input-field w-auto">
                  <option value="">Filter by tag...</option>
                  ${this.getAllTags().map(tag => `<option value="${tag}">${tag}</option>`).join('')}
                </select>
              </div>
              
              <div class="flex space-x-2">
                <button class="btn-secondary ${this.isDragMode ? 'bg-primary-100 border-primary-300' : ''}" id="toggle-drag-mode">
                  ${this.isDragMode ? '✅ Organizing' : '🔄 Organize'}
                </button>
                <select id="sort-options" class="input-field w-auto">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most-used">Most Used</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
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
        this.render(this.getElement('main-content'))
      })
    })

    // Search
    this.getElement('search-input').addEventListener('input', (e) => {
      this.searchQuery = e.target.value
      this.renderContent()
    })

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentFilter = e.target.getAttribute('data-filter')
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
        e.target.classList.add('active')
        this.renderContent()
      })
    })

    // Tag filter
    this.getElement('tag-filter').addEventListener('change', (e) => {
      this.selectedTag = e.target.value
      this.renderContent()
    })

    // Sort options
    this.getElement('sort-options').addEventListener('change', (e) => {
      this.currentSort = e.target.value
      this.renderContent()
    })

    // Drag mode toggle
    this.getElement('toggle-drag-mode').addEventListener('click', () => {
      this.isDragMode = !this.isDragMode
      const btn = this.getElement('toggle-drag-mode')
      if (this.isDragMode) {
        btn.textContent = '✅ Organizing'
        btn.classList.add('bg-primary-100', 'border-primary-300')
      } else {
        btn.textContent = '🔄 Organize'
        btn.classList.remove('bg-primary-100', 'border-primary-300')
      }
      this.renderContent()
    })

    // Actions
    this.getElement('import-data').addEventListener('click', () => {
      this.importData()
    })

    this.getElement('export-data').addEventListener('click', () => {
      this.exportData()
    })

    this.getElement('clear-all').addEventListener('click', () => {
      this.clearAll()
    })
  }

  loadData() {
    this.savedColors = JSON.parse(localStorage.getItem('savedColors') || '[]')
    this.savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]')
  }

  renderContent() {
    const contentArea = this.getElement('collection-content')
    const emptyState = this.getElement('empty-state')

    if (this.currentView === 'colors') {
      let filteredColors = this.getFilteredAndSortedColors()
      
      if (filteredColors.length === 0 && this.savedColors.length === 0) {
        contentArea.innerHTML = ''
        emptyState.classList.remove('hidden')
      } else if (filteredColors.length === 0) {
        emptyState.classList.add('hidden')
        contentArea.innerHTML = `
          <div class="text-center py-12">
            <p class="text-gray-600">No colors match your current filters.</p>
            <button class="btn-secondary mt-2" onclick="this.getElement('search-input').value = ''; this.searchQuery = ''; this.renderContent()">
              Clear Filters
            </button>
          </div>
        `
      } else {
        emptyState.classList.add('hidden')
        this.renderColors(contentArea, filteredColors)
      }
    } else {
      let filteredPalettes = this.getFilteredAndSortedPalettes()
      
      if (filteredPalettes.length === 0 && this.savedPalettes.length === 0) {
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
      } else if (filteredPalettes.length === 0) {
        contentArea.innerHTML = `
          <div class="text-center py-12">
            <p class="text-gray-600">No palettes match your current filters.</p>
            <button class="btn-secondary mt-2" onclick="this.getElement('search-input').value = ''; this.searchQuery = ''; this.renderContent()">
              Clear Filters
            </button>
          </div>
        `
      } else {
        this.renderPalettes(contentArea, filteredPalettes)
      }
    }
  }

  getFilteredAndSortedColors() {
    let filtered = [...this.savedColors]
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase()
      filtered = filtered.filter(color => 
        color.hex.toLowerCase().includes(query) ||
        (color.tags && color.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }
    
    // Apply category filter
    if (this.currentFilter === 'favorites') {
      filtered = filtered.filter(color => color.isFavorite)
    } else if (this.currentFilter === 'recent') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      filtered = filtered.filter(color => new Date(color.createdAt || color.timestamp) > oneWeekAgo)
    }
    
    // Apply tag filter
    if (this.selectedTag) {
      filtered = filtered.filter(color => 
        color.tags && color.tags.includes(this.selectedTag)
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'newest':
          return new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)
        case 'oldest':
          return new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp)
        case 'most-used':
          return (b.usageCount || 0) - (a.usageCount || 0)
        case 'alphabetical':
          return a.hex.localeCompare(b.hex)
        default:
          return 0
      }
    })
    
    return filtered
  }

  getFilteredAndSortedPalettes() {
    let filtered = [...this.savedPalettes]
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase()
      filtered = filtered.filter(palette => 
        palette.name.toLowerCase().includes(query) ||
        (palette.tags && palette.tags.some(tag => tag.toLowerCase().includes(query))) ||
        palette.colors.some(color => color.hex.toLowerCase().includes(query))
      )
    }
    
    // Apply category filter
    if (this.currentFilter === 'favorites') {
      filtered = filtered.filter(palette => palette.isFavorite)
    } else if (this.currentFilter === 'recent') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      filtered = filtered.filter(palette => new Date(palette.createdAt || palette.timestamp) > oneWeekAgo)
    }
    
    // Apply tag filter
    if (this.selectedTag) {
      filtered = filtered.filter(palette => 
        palette.tags && palette.tags.includes(this.selectedTag)
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'newest':
          return new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)
        case 'oldest':
          return new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp)
        case 'most-used':
          return (b.usageCount || 0) - (a.usageCount || 0)
        case 'alphabetical':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
    
    return filtered
  }

  renderColors(container, colors = null) {
    const colorsToRender = colors || this.savedColors
    
    container.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4" id="colors-grid">
        ${colorsToRender.map(color => `
          <div class="color-item group relative ${this.isDragMode ? 'draggable cursor-move' : ''}" 
               data-color="${color.hex}" 
               data-id="${color.id}"
               ${this.isDragMode ? 'draggable="true"' : ''}>
            
            <!-- Favorite Star -->
            <button class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white bg-opacity-80 flex items-center justify-center text-xs z-10 hover:bg-opacity-100 transition-all ${color.isFavorite ? 'text-yellow-500' : 'text-gray-400'}"
                    onclick="this.toggleFavorite('${color.id}')" title="${color.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
              ${color.isFavorite ? '⭐' : '☆'}
            </button>
            
            <!-- Color Square -->
            <div class="aspect-square rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-all hover:scale-105"
                 style="background-color: ${color.hex}"
                 onclick="navigator.clipboard.writeText('${color.hex}'); this.showToast('Copied ${color.hex}')"
                 title="Click to copy ${color.hex}">
            </div>
            
            <!-- Color Info -->
            <div class="text-xs text-center mt-1 font-mono">${color.hex}</div>
            <div class="text-xs text-center text-gray-500">${new Date(color.createdAt || color.timestamp).toLocaleDateString()}</div>
            
            <!-- Tags -->
            ${color.tags && color.tags.length > 0 ? `
              <div class="flex flex-wrap gap-1 mt-1 justify-center">
                ${color.tags.slice(0, 2).map(tag => `
                  <span class="inline-block bg-gray-100 text-gray-600 text-xs px-1 py-0.5 rounded">${tag}</span>
                `).join('')}
                ${color.tags.length > 2 ? `<span class="text-xs text-gray-400">+${color.tags.length - 2}</span>` : ''}
              </div>
            ` : ''}
            
            <!-- Actions Overlay -->
            <div class="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm hover:bg-gray-100"
                      onclick="navigator.clipboard.writeText('${color.hex}'); this.showToast('Copied!')" title="Copy">
                📋
              </button>
              <button class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm hover:bg-gray-100"
                      onclick="this.editColorTags('${color.id}')" title="Edit Tags">
                🏷️
              </button>
              <button class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm hover:bg-gray-100"
                      onclick="this.deleteColor('${color.id}')" title="Delete">
                🗑️
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `

    this.setupColorActions()
    if (this.isDragMode) {
      this.setupDragAndDrop()
    }
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

  toggleFavorite(colorId) {
    const colorIndex = this.savedColors.findIndex(c => c.id.toString() === colorId)
    if (colorIndex !== -1) {
      this.savedColors[colorIndex].isFavorite = !this.savedColors[colorIndex].isFavorite
      this.savedColors[colorIndex].lastUsed = new Date().toISOString()
      localStorage.setItem('savedColors', JSON.stringify(this.savedColors))
      this.renderContent()
    }
  }

  editColorTags(colorId) {
    const color = this.savedColors.find(c => c.id.toString() === colorId)
    if (!color) return

    const currentTags = color.tags || []
    const newTags = prompt('Enter tags (comma-separated):', currentTags.join(', '))
    
    if (newTags !== null) {
      color.tags = newTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      color.lastUsed = new Date().toISOString()
      localStorage.setItem('savedColors', JSON.stringify(this.savedColors))
      this.renderContent()
    }
  }

  deleteColor(colorId) {
    if (confirm('Are you sure you want to delete this color?')) {
      this.savedColors = this.savedColors.filter(c => c.id.toString() !== colorId)
      localStorage.setItem('savedColors', JSON.stringify(this.savedColors))
      this.renderContent()
    }
  }

  setupDragAndDrop() {
    const colorItems = document.querySelectorAll('.color-item')
    
    colorItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', item.dataset.id)
        item.classList.add('opacity-50')
      })
      
      item.addEventListener('dragend', (e) => {
        item.classList.remove('opacity-50')
      })
      
      item.addEventListener('dragover', (e) => {
        e.preventDefault()
        item.classList.add('border-primary-400', 'scale-105')
      })
      
      item.addEventListener('dragleave', (e) => {
        item.classList.remove('border-primary-400', 'scale-105')
      })
      
      item.addEventListener('drop', (e) => {
        e.preventDefault()
        item.classList.remove('border-primary-400', 'scale-105')
        
        const draggedId = e.dataTransfer.getData('text/plain')
        const targetId = item.dataset.id
        
        if (draggedId !== targetId) {
          this.reorderColors(draggedId, targetId)
        }
      })
    })
  }

  reorderColors(draggedId, targetId) {
    const draggedIndex = this.savedColors.findIndex(c => c.id.toString() === draggedId)
    const targetIndex = this.savedColors.findIndex(c => c.id.toString() === targetId)
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const draggedColor = this.savedColors.splice(draggedIndex, 1)[0]
      this.savedColors.splice(targetIndex, 0, draggedColor)
      
      localStorage.setItem('savedColors', JSON.stringify(this.savedColors))
      this.renderContent()
      this.showToast('Colors reordered!')
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
            
            this.render(this.getElement('main-content'))
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

  getAllTags() {
    const allTags = new Set()
    
    this.savedColors.forEach(color => {
      if (color.tags) {
        color.tags.forEach(tag => allTags.add(tag))
      }
    })
    
    this.savedPalettes.forEach(palette => {
      if (palette.tags) {
        palette.tags.forEach(tag => allTags.add(tag))
      }
    })
    
    return Array.from(allTags).sort()
  }
}
