export class ColorCollection {
  constructor(options = {}) {
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
    this.selectedTag = ''
    this.selectedColorIds = new Set()
    this.isDragMode = false
    this.sharedPalette = options.sharedPalette || null
    
    // Initialize data migration
    this.migrateDataIfNeeded()
  }

  // Helper method to get elements within this container
  getElement(id) {
    return this.container ? this.container.querySelector(`#${id}`) : null
  }

  parseStoredArray(key) {
    try {
      const value = localStorage.getItem(key)
      const parsed = value ? JSON.parse(value) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
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
      const colors = this.parseStoredArray('savedColors')
      const updatedColors = colors.map(color => ({
        ...color,
        tags: color.tags || [],
        isFavorite: color.isFavorite || false,
        createdAt: color.timestamp || new Date().toISOString(),
        lastUsed: color.lastUsed || color.timestamp || new Date().toISOString()
      }))
      
      localStorage.setItem('savedColors', JSON.stringify(updatedColors))
      
      // Add missing properties to existing palettes
      const palettes = this.parseStoredArray('savedPalettes')
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
      <div class="space-y-8 color-collection">
        <!-- Hero Section -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">My Color Collection</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Manage your saved colors and palettes. Organize, search, and export your color collections.
          </p>
        </div>

        ${this.renderSharedPaletteBanner()}

        <!-- View Toggle -->
        <div class="flex justify-center">
          <div class="bg-gray-100 p-1 rounded-lg flex flex-wrap justify-center gap-1">
            <button class="view-toggle px-3 sm:px-4 py-2 rounded-md text-sm transition-colors ${this.currentView === 'colors' ? 'bg-white shadow-sm' : ''}" 
                    data-view="colors">
              Individual Colors (${this.savedColors.length})
            </button>
            <button class="view-toggle px-3 sm:px-4 py-2 rounded-md text-sm transition-colors ${this.currentView === 'palettes' ? 'bg-white shadow-sm' : ''}" 
                    data-view="palettes">
              Color Palettes (${this.savedPalettes.length})
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
                       class="input-field search-input" 
                       placeholder="Search colors or palettes...">
              </div>
              <div class="flex flex-wrap justify-center gap-2 w-full sm:w-auto items-center">
                <select id="export-format" class="input-field w-auto">
                  <option value="json">JSON</option>
                  <option value="gpl">GPL</option>
                  <option value="css">CSS Variables</option>
                </select>
                <button class="btn-secondary flex-1 sm:flex-none" id="import-data">Import</button>
                <button class="btn-secondary flex-1 sm:flex-none" id="export-data">Export</button>
                <button class="btn-primary flex-1 sm:flex-none" id="clear-all">Clear All</button>
              </div>
            </div>
            
            <!-- Filter and Organization Row -->
            <div class="flex flex-col sm:flex-row gap-4 items-center justify-between border-t pt-4">
              <div class="flex flex-wrap gap-2">
                <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                  All
                </button>
                <button class="filter-btn ${this.currentFilter === 'favorites' ? 'active' : ''}" data-filter="favorites">
                  Favorites
                </button>
                <button class="filter-btn ${this.currentFilter === 'recent' ? 'active' : ''}" data-filter="recent">
                  Recent
                </button>
                <select id="tag-filter" class="input-field w-auto">
                  <option value="">Filter by tag...</option>
                  ${this.getAllTags().map(tag => `<option value="${tag}">${tag}</option>`).join('')}
                </select>
              </div>
              
              <div class="flex space-x-2">
                <button class="btn-secondary ${this.isDragMode ? 'bg-primary-100 border-primary-300' : ''} organize-mode-btn" id="toggle-drag-mode">
                  ${this.isDragMode ? 'Organizing' : 'Organize'}
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
             <button class="btn-primary start-converting-btn">
              Start Converting Colors
            </button>
          </div>
        </div>
      </div>
    `

    this.setupEventListeners()
    this.renderContent()
  }

  renderSharedPaletteBanner() {
    if (!this.sharedPalette || !Array.isArray(this.sharedPalette.hexes) || this.sharedPalette.hexes.length === 0) {
      return ''
    }

    const safeName = this.escapeHtml(this.sharedPalette.name || 'Shared Palette')
    const swatches = this.sharedPalette.hexes.slice(0, 12)
    const extraCount = this.sharedPalette.hexes.length - swatches.length

    return `
      <div class="card border border-primary-200 bg-primary-50/40">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-wide text-primary-700 font-semibold">Shared Palette Link</p>
              <h3 class="text-lg font-semibold text-gray-900">${safeName}</h3>
              <p class="text-sm text-gray-600">${this.sharedPalette.hexes.length} color${this.sharedPalette.hexes.length === 1 ? '' : 's'} ready to import.</p>
            </div>
            <div class="flex gap-2">
              <button class="btn-primary" id="import-shared-palette">Import Palette</button>
              <button class="btn-secondary" id="dismiss-shared-palette">Dismiss</button>
            </div>
          </div>
          <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
            ${swatches.map((hex) => `
              <div class="h-8 rounded border border-gray-200" style="background-color: ${hex}" title="${hex}"></div>
            `).join('')}
            ${extraCount > 0 ? `<div class="h-8 rounded border border-dashed border-gray-300 text-xs flex items-center justify-center text-gray-600">+${extraCount}</div>` : ''}
          </div>
        </div>
      </div>
    `
  }

  setupEventListeners() {
    // View toggle
    this.container.querySelectorAll('.view-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log('View toggle clicked:', e.target.getAttribute('data-view'))
        this.currentView = e.target.getAttribute('data-view')
        console.log('Current view set to:', this.currentView)
        
        // Just update the content, don't re-render the entire component
        this.renderContent()
        
        // Update the view toggle button styles
        this.container.querySelectorAll('.view-toggle').forEach(toggleBtn => {
          if (toggleBtn.getAttribute('data-view') === this.currentView) {
            toggleBtn.classList.add('bg-white', 'shadow-sm')
          } else {
            toggleBtn.classList.remove('bg-white', 'shadow-sm')
          }
        })
      })
    })

    // Search
    this.getElement('search-input').addEventListener('input', (e) => {
      this.searchQuery = e.target.value
      this.renderContent()
    })

    // Filter buttons (scoped to container)
    this.container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentFilter = e.target.getAttribute('data-filter')
        this.container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
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
        btn.textContent = 'Organizing'
        btn.classList.add('bg-primary-100', 'border-primary-300')
      } else {
        btn.textContent = 'Organize'
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

    this.getElement('import-shared-palette')?.addEventListener('click', () => {
      this.importSharedPalette()
    })

    this.getElement('dismiss-shared-palette')?.addEventListener('click', () => {
      this.sharedPalette = null
      this.render(this.container)
    })

    // Start converting button (empty state)
    this.container.querySelector('.start-converting-btn')?.addEventListener('click', () => {
      document.querySelector('[data-view="converter"]').click()
    })

    // Clear filters buttons (using event delegation since they're created dynamically)
    this.container.addEventListener('click', (e) => {
      if (e.target.id === 'clear-filters-btn' || e.target.id === 'clear-filters-palettes-btn') {
        this.searchQuery = ''
        this.currentFilter = 'all'
        this.selectedTag = ''

        const searchInput = this.getElement('search-input')
        if (searchInput) searchInput.value = ''

        const tagFilter = this.getElement('tag-filter')
        if (tagFilter) tagFilter.value = ''

        this.container.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all')
        })

        this.renderContent()
      } else if (e.target.id === 'go-to-image-picker') {
        // Navigate without inline onclick
        document.querySelector('[data-view="image-picker"]').click()
      }
    })
  }

  loadData() {
    this.savedColors = this.parseStoredArray('savedColors')
    this.savedPalettes = this.parseStoredArray('savedPalettes')
  }

  renderContent() {
    console.log('renderContent called, currentView:', this.currentView)
    const contentArea = this.getElement('collection-content')
    const emptyState = this.getElement('empty-state')
    console.log('contentArea found:', !!contentArea, 'emptyState found:', !!emptyState)

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
            <button class="btn-secondary mt-2" id="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        `
      } else {
        emptyState.classList.add('hidden')
        this.renderColors(contentArea, filteredColors)
      }
    } else {
      console.log('Rendering palettes view')
      let filteredPalettes = this.getFilteredAndSortedPalettes()
      console.log('Filtered palettes:', filteredPalettes.length, 'Total palettes:', this.savedPalettes.length)
      
      if (filteredPalettes.length === 0 && this.savedPalettes.length === 0) {
        contentArea.innerHTML = `
          <div class="text-center py-12">
            <div class="max-w-md mx-auto">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">🎭</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No palettes saved yet</h3>
              <p class="text-gray-600 mb-4">Create color palettes by extracting colors from images.</p>
            <button class="btn-primary" id="go-to-image-picker">
                Pick Colors from Images
              </button>
            </div>
          </div>
        `
      } else if (filteredPalettes.length === 0) {
        contentArea.innerHTML = `
          <div class="text-center py-12">
            <p class="text-gray-600">No palettes match your current filters.</p>
            <button class="btn-secondary mt-2" id="clear-filters-palettes-btn">
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
            <button class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white bg-opacity-80 flex items-center justify-center text-xs z-10 hover:bg-opacity-100 transition-all ${color.isFavorite ? 'text-yellow-500' : 'text-gray-400'} toggle-favorite-btn"
                    data-id="${color.id}" title="${color.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
              ${color.isFavorite ? '⭐' : '☆'}
            </button>
            
            <!-- Color Square -->
             <button class="aspect-square w-full rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-all hover:scale-105 color-swatch-btn"
                 style="background-color: ${color.hex}"
                 data-hex="${color.hex}"
                 title="Click to copy ${color.hex}">
             </button>
            
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
               <button class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm hover:bg-gray-100 copy-color-btn" data-hex="${color.hex}" title="Copy">
                📋
              </button>
               <button class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm hover:bg-gray-100 edit-tags-btn" data-id="${color.id}" title="Edit Tags">
                🏷️
              </button>
               <button class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm hover:bg-gray-100 delete-color-btn" data-id="${color.id}" title="Delete">
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

  renderPalettes(container, palettes = this.savedPalettes) {
    container.innerHTML = `
      <div class="space-y-6" id="palettes-grid">
        ${palettes.map(palette => `
          <div class="card palette-item" data-id="${palette.id}">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-semibold text-lg">${palette.name}</h3>
                <p class="text-sm text-gray-600">${palette.colors.length} colors • ${new Date(palette.timestamp).toLocaleDateString()}</p>
              </div>
              <div class="flex space-x-2">
                <button class="text-gray-400 hover:text-primary-600 share-palette-btn" data-id="${palette.id}" title="Share palette link">
                  🔗
                </button>
                <button class="text-gray-400 hover:text-gray-600 copy-palette-btn" data-id="${palette.id}" title="Copy all colors">
                  📋
                </button>
                <button class="text-gray-400 hover:text-red-600 delete-palette-btn" data-id="${palette.id}" title="Delete palette">
                  🗑️
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              ${palette.colors.map(color => `
                <button class="aspect-square rounded border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors palette-color-tile"
                     style="background-color: ${color.hex}"
                     title="${color.hex}"
                     data-hex="${color.hex}">
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `

    // Wire up palette actions
    container.querySelectorAll('.copy-palette-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const id = btn.dataset.id
        this.copyPalette(id)
      })
    })
    container.querySelectorAll('.share-palette-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const id = btn.dataset.id
        this.sharePalette(id)
      })
    })
    container.querySelectorAll('.delete-palette-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const id = btn.dataset.id
        this.deletePalette(id)
      })
    })

    container.querySelectorAll('.palette-color-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const hex = tile.dataset.hex
        navigator.clipboard.writeText(hex)
        this.showToast(`Copied ${hex}`)
      })
    })
  }

  setupColorActions() {
    // Add click to copy functionality
    this.container.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.dataset.hex
        navigator.clipboard.writeText(hex)
        this.showToast(`Copied ${hex}`)
      })
    })

    // Actions overlay buttons
    this.container.querySelectorAll('.copy-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const hex = btn.dataset.hex
        navigator.clipboard.writeText(hex)
        this.showToast('Copied!')
      })
    })

    this.container.querySelectorAll('.edit-tags-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const id = btn.dataset.id
        this.editColorTags(id)
      })
    })

    this.container.querySelectorAll('.delete-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const id = btn.dataset.id
        this.deleteColor(id)
      })
    })

    // Favorite star toggle
    this.container.querySelectorAll('.toggle-favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const id = btn.dataset.id
        this.toggleFavorite(id)
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

  copyPalette(paletteId) {
    const palette = this.savedPalettes.find(p => p.id.toString() === paletteId)
    if (!palette || !Array.isArray(palette.colors)) return

    const colors = palette.colors
      .map(color => color?.hex)
      .filter(Boolean)
      .join(', ')

    if (!colors) return

    navigator.clipboard.writeText(colors)
    palette.usageCount = (palette.usageCount || 0) + 1
    palette.lastUsed = new Date().toISOString()
    localStorage.setItem('savedPalettes', JSON.stringify(this.savedPalettes))
    this.showToast('Palette copied!')
  }

  sharePalette(paletteId) {
    const palette = this.savedPalettes.find(p => p.id.toString() === paletteId)
    if (!palette || !Array.isArray(palette.colors) || palette.colors.length === 0) return

    const colors = palette.colors
      .map((color) => this.normalizeHex(color?.hex))
      .filter(Boolean)

    if (colors.length === 0) return

    const params = new URLSearchParams({
      name: palette.name || 'Shared Palette',
      colors: colors.join(',')
    })

    const shareUrl = `${window.location.origin}/palette?${params.toString()}`
    navigator.clipboard.writeText(shareUrl)
    this.showToast('Palette link copied!')
  }

  importSharedPalette() {
    if (!this.sharedPalette || !Array.isArray(this.sharedPalette.hexes) || this.sharedPalette.hexes.length === 0) {
      return
    }

    const paletteColors = this.sharedPalette.hexes
      .map((hex) => this.normalizeHex(hex))
      .filter(Boolean)
      .map((hex) => ({
        hex,
        rgb: this.hexToRgb(hex),
        timestamp: new Date().toISOString(),
        id: Date.now() + Math.random()
      }))

    if (paletteColors.length === 0) return

    const paletteData = {
      name: this.sharedPalette.name || 'Shared Palette',
      colors: paletteColors,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      id: Date.now(),
      tags: ['shared-link'],
      isFavorite: false
    }

    const alreadyExists = this.savedPalettes.some((palette) => {
      const existingHexes = (palette.colors || [])
        .map((color) => this.normalizeHex(color?.hex))
        .filter(Boolean)
      return existingHexes.length === paletteColors.length &&
        existingHexes.every((hex, index) => hex === paletteColors[index].hex)
    })

    if (!alreadyExists) {
      this.savedPalettes.push(paletteData)
      localStorage.setItem('savedPalettes', JSON.stringify(this.savedPalettes))
    }

    const existingColorSet = new Set(this.savedColors.map((color) => this.normalizeHex(color.hex)).filter(Boolean))
    paletteColors.forEach((color) => {
      if (existingColorSet.has(color.hex)) return
      this.savedColors.push({
        hex: color.hex,
        r: color.rgb.r,
        g: color.rgb.g,
        b: color.rgb.b,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        id: Date.now() + Math.random(),
        tags: ['shared-link'],
        isFavorite: false,
        usageCount: 0
      })
      existingColorSet.add(color.hex)
    })

    localStorage.setItem('savedColors', JSON.stringify(this.savedColors))

    this.sharedPalette = null
    this.render(this.container)
    this.showToast('Shared palette imported!')
  }

  deletePalette(paletteId) {
    if (!confirm('Are you sure you want to delete this palette?')) return

    this.savedPalettes = this.savedPalettes.filter(p => p.id.toString() !== paletteId)
    localStorage.setItem('savedPalettes', JSON.stringify(this.savedPalettes))
    this.renderContent()
    this.showToast('Palette deleted!')
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

  normalizeHex(value) {
    if (!value || typeof value !== 'string') return null

    let hex = value.trim().toLowerCase()
    if (!hex.startsWith('#')) {
      hex = `#${hex}`
    }

    if (/^#[0-9a-f]{3}$/.test(hex)) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    }

    return /^#[0-9a-f]{6}$/.test(hex) ? hex : null
  }

  hexToRgb(hex) {
    const normalized = this.normalizeHex(hex)
    if (!normalized) return { r: 0, g: 0, b: 0 }

    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
    if (!match) return { r: 0, g: 0, b: 0 }

    return {
      r: parseInt(match[1], 16),
      g: parseInt(match[2], 16),
      b: parseInt(match[3], 16)
    }
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((value) => {
      const safe = Math.max(0, Math.min(255, Math.round(value)))
      const hex = safe.toString(16)
      return hex.length === 1 ? `0${hex}` : hex
    }).join('')
  }

  escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
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
    input.accept = '.json,.gpl,.css,.txt'
    
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const imported = this.parseImportFile(file.name, String(event.target.result || ''))
            const added = this.mergeImportedData(imported)
            this.render(this.container)
            this.showToast(`Imported ${added.colors} colors and ${added.palettes} palettes!`)
          } catch {
            alert('Unsupported or invalid import file format.')
          }
        }
        reader.readAsText(file)
      }
    }
    
    input.click()
  }

  exportData() {
    const format = this.getElement('export-format')?.value || 'json'
    const dateSuffix = new Date().toISOString().split('T')[0]

    if (format === 'json') {
      const data = {
        colors: this.savedColors,
        palettes: this.savedPalettes,
        exportDate: new Date().toISOString()
      }
      this.downloadTextFile(
        `color-awesome-export-${dateSuffix}.json`,
        JSON.stringify(data, null, 2),
        'application/json'
      )
      this.showToast('JSON export completed!')
      return
    }

    const exportHexes = this.getExportHexes()
    if (exportHexes.length === 0) {
      this.showToast('Nothing to export yet.')
      return
    }

    if (format === 'gpl') {
      const content = this.buildGplContent(exportHexes)
      this.downloadTextFile(
        `color-awesome-palette-${dateSuffix}.gpl`,
        content,
        'text/plain'
      )
      this.showToast('GPL export completed!')
      return
    }

    if (format === 'css') {
      const content = this.buildCssVariablesContent(exportHexes)
      this.downloadTextFile(
        `color-awesome-palette-${dateSuffix}.css`,
        content,
        'text/css'
      )
      this.showToast('CSS variables export completed!')
    }
  }

  parseImportFile(fileName, content) {
    const lowerName = fileName.toLowerCase()

    if (lowerName.endsWith('.json')) {
      return this.parseJsonImport(content)
    }

    if (lowerName.endsWith('.gpl')) {
      return this.parseGplImport(content)
    }

    if (lowerName.endsWith('.css')) {
      return this.parseCssImport(content)
    }

    if (lowerName.endsWith('.txt')) {
      if (content.includes('GIMP Palette')) {
        return this.parseGplImport(content)
      }
      return this.parseCssImport(content)
    }

    try {
      return this.parseJsonImport(content)
    } catch {
      try {
        return this.parseGplImport(content)
      } catch {
        return this.parseCssImport(content)
      }
    }
  }

  parseJsonImport(content) {
    const parsed = JSON.parse(content)
    const imported = { colors: [], palettes: [] }

    if (Array.isArray(parsed)) {
      parsed.forEach((entry) => {
        const color = this.sanitizeImportedColor(entry)
        if (color) imported.colors.push(color)
      })
      return imported
    }

    if (Array.isArray(parsed.colors)) {
      parsed.colors.forEach((entry) => {
        const color = this.sanitizeImportedColor(entry)
        if (color) imported.colors.push(color)
      })
    }

    if (Array.isArray(parsed.palettes)) {
      parsed.palettes.forEach((entry) => {
        const palette = this.sanitizeImportedPalette(entry)
        if (palette) imported.palettes.push(palette)
      })
    }

    if (imported.colors.length === 0 && imported.palettes.length === 0) {
      throw new Error('No importable colors found')
    }

    return imported
  }

  parseGplImport(content) {
    const lines = content.split(/\r?\n/)
    let paletteName = 'Imported GPL Palette'
    const colors = []

    lines.forEach((line) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('Name:')) {
        paletteName = trimmed.replace('Name:', '').trim() || paletteName
        return
      }

      const match = trimmed.match(/^(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})(?:\s+(.+))?$/)
      if (!match) return

      const r = Math.max(0, Math.min(255, Number(match[1])))
      const g = Math.max(0, Math.min(255, Number(match[2])))
      const b = Math.max(0, Math.min(255, Number(match[3])))
      const hex = this.rgbToHex(r, g, b)
      colors.push(this.createPaletteColor(hex))
    })

    if (colors.length === 0) {
      throw new Error('No colors found in GPL file')
    }

    return {
      colors: colors.map((color) => ({
        hex: color.hex,
        r: color.rgb.r,
        g: color.rgb.g,
        b: color.rgb.b,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        id: Date.now() + Math.random(),
        tags: [],
        isFavorite: false,
        usageCount: 0
      })),
      palettes: [
        {
          id: Date.now() + Math.random(),
          name: paletteName,
          colors,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          tags: ['imported-gpl'],
          isFavorite: false,
          usageCount: 0
        }
      ]
    }
  }

  parseCssImport(content) {
    const matches = content.match(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g) || []
    const unique = [...new Set(matches.map((match) => this.normalizeHex(match)).filter(Boolean))]

    if (unique.length === 0) {
      throw new Error('No HEX colors found in CSS')
    }

    const paletteColors = unique.map((hex) => this.createPaletteColor(hex))

    return {
      colors: paletteColors.map((color) => ({
        hex: color.hex,
        r: color.rgb.r,
        g: color.rgb.g,
        b: color.rgb.b,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        id: Date.now() + Math.random(),
        tags: [],
        isFavorite: false,
        usageCount: 0
      })),
      palettes: [
        {
          id: Date.now() + Math.random(),
          name: 'Imported CSS Palette',
          colors: paletteColors,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          tags: ['imported-css'],
          isFavorite: false,
          usageCount: 0
        }
      ]
    }
  }

  sanitizeImportedColor(entry) {
    if (typeof entry === 'string') {
      const normalized = this.normalizeHex(entry)
      if (!normalized) return null
      const rgb = this.hexToRgb(normalized)
      return {
        hex: normalized,
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        id: Date.now() + Math.random(),
        tags: [],
        isFavorite: false,
        usageCount: 0
      }
    }

    if (!entry || typeof entry !== 'object') return null
    const normalized = this.normalizeHex(entry.hex)
    if (!normalized) return null

    const rgb = this.hexToRgb(normalized)
    return {
      ...entry,
      hex: normalized,
      r: Number.isFinite(entry.r) ? entry.r : rgb.r,
      g: Number.isFinite(entry.g) ? entry.g : rgb.g,
      b: Number.isFinite(entry.b) ? entry.b : rgb.b,
      id: entry.id || Date.now() + Math.random(),
      timestamp: entry.timestamp || new Date().toISOString(),
      createdAt: entry.createdAt || entry.timestamp || new Date().toISOString(),
      lastUsed: entry.lastUsed || entry.timestamp || new Date().toISOString(),
      tags: Array.isArray(entry.tags) ? entry.tags : [],
      isFavorite: Boolean(entry.isFavorite),
      usageCount: Number.isFinite(entry.usageCount) ? entry.usageCount : 0
    }
  }

  sanitizeImportedPalette(entry) {
    if (!entry || typeof entry !== 'object' || !Array.isArray(entry.colors)) return null

    const colors = entry.colors
      .map((color) => {
        if (typeof color === 'string') {
          const normalized = this.normalizeHex(color)
          return normalized ? this.createPaletteColor(normalized) : null
        }
        const normalized = this.normalizeHex(color?.hex)
        if (!normalized) return null
        return {
          ...color,
          hex: normalized,
          rgb: color.rgb || this.hexToRgb(normalized),
          id: color.id || Date.now() + Math.random(),
          timestamp: color.timestamp || new Date().toISOString()
        }
      })
      .filter(Boolean)

    if (colors.length === 0) return null

    return {
      ...entry,
      id: entry.id || Date.now() + Math.random(),
      name: (entry.name || 'Imported Palette').toString().slice(0, 80),
      colors,
      timestamp: entry.timestamp || new Date().toISOString(),
      createdAt: entry.createdAt || entry.timestamp || new Date().toISOString(),
      tags: Array.isArray(entry.tags) ? entry.tags : [],
      isFavorite: Boolean(entry.isFavorite),
      usageCount: Number.isFinite(entry.usageCount) ? entry.usageCount : 0
    }
  }

  createPaletteColor(hex) {
    const normalized = this.normalizeHex(hex)
    const rgb = this.hexToRgb(normalized)
    return {
      hex: normalized,
      rgb,
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    }
  }

  mergeImportedData(imported) {
    let addedColors = 0
    let addedPalettes = 0

    const existingColorHexes = new Set(
      this.savedColors
        .map((color) => this.normalizeHex(color.hex))
        .filter(Boolean)
    )

    imported.colors.forEach((color) => {
      const sanitized = this.sanitizeImportedColor(color)
      if (!sanitized || existingColorHexes.has(sanitized.hex)) return
      this.savedColors.push(sanitized)
      existingColorHexes.add(sanitized.hex)
      addedColors += 1
    })

    const paletteSignatures = new Set(this.savedPalettes.map((palette) => this.getPaletteSignature(palette)))
    imported.palettes.forEach((palette) => {
      const sanitized = this.sanitizeImportedPalette(palette)
      if (!sanitized) return

      const signature = this.getPaletteSignature(sanitized)
      if (paletteSignatures.has(signature)) return

      this.savedPalettes.push(sanitized)
      paletteSignatures.add(signature)
      addedPalettes += 1

      sanitized.colors.forEach((color) => {
        const normalized = this.normalizeHex(color.hex)
        if (!normalized || existingColorHexes.has(normalized)) return
        const rgb = this.hexToRgb(normalized)
        this.savedColors.push({
          hex: normalized,
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          id: Date.now() + Math.random(),
          tags: [],
          isFavorite: false,
          usageCount: 0
        })
        existingColorHexes.add(normalized)
        addedColors += 1
      })
    })

    localStorage.setItem('savedColors', JSON.stringify(this.savedColors))
    localStorage.setItem('savedPalettes', JSON.stringify(this.savedPalettes))

    return { colors: addedColors, palettes: addedPalettes }
  }

  getPaletteSignature(palette) {
    const name = (palette.name || '').trim().toLowerCase()
    const colorSignature = (palette.colors || [])
      .map((color) => this.normalizeHex(color?.hex))
      .filter(Boolean)
      .join(',')
    return `${name}:${colorSignature}`
  }

  getExportHexes() {
    const sourceHexes = this.currentView === 'palettes'
      ? this.savedPalettes.flatMap((palette) =>
          (palette.colors || [])
            .map((color) => this.normalizeHex(color?.hex))
            .filter(Boolean)
        )
      : this.savedColors
          .map((color) => this.normalizeHex(color.hex))
          .filter(Boolean)

    return [...new Set(sourceHexes)]
  }

  buildGplContent(hexes) {
    const lines = [
      'GIMP Palette',
      `Name: Color Awesome ${this.currentView === 'palettes' ? 'Palettes' : 'Colors'}`,
      'Columns: 8',
      '#'
    ]

    hexes.forEach((hex) => {
      const rgb = this.hexToRgb(hex)
      lines.push(`${rgb.r} ${rgb.g} ${rgb.b} ${hex}`)
    })

    return lines.join('\n')
  }

  buildCssVariablesContent(hexes) {
    const lines = [
      `/* Exported from Color Awesome on ${new Date().toISOString()} */`,
      ':root {'
    ]

    hexes.forEach((hex, index) => {
      lines.push(`  --color-awesome-${index + 1}: ${hex};`)
    })
    lines.push('}')

    return lines.join('\n')
  }

  downloadTextFile(fileName, content, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()

    URL.revokeObjectURL(url)
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
