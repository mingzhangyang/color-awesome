export class Navigation {
  constructor(currentView, onViewChange) {
    this.currentView = currentView
    this.onViewChange = onViewChange
  }

  render() {
    const navElement = document.getElementById('navigation')
    
    const navItems = [
      { id: 'converter', label: 'Color Converter', icon: '🎨' },
      { id: 'image-picker', label: 'Image Picker', icon: '📷' },
      { id: 'collection', label: 'My Colors', icon: '💾' }
    ]

    navElement.innerHTML = `
      <div class="flex space-x-1">
        ${navItems.map(item => `
          <button 
            class="nav-item flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              this.currentView === item.id 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }"
            data-view="${item.id}"
          >
            <span>${item.icon}</span>
            <span class="hidden sm:inline">${item.label}</span>
          </button>
        `).join('')}
      </div>
    `

    this.setupEventListeners()
  }

  setupEventListeners() {
    const navItems = document.querySelectorAll('.nav-item')
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view')
        this.currentView = view
        this.onViewChange(view)
        this.render() // Re-render to update active state
      })
    })
  }

  updateActiveView(view) {
    this.currentView = view
    const navItems = document.querySelectorAll('.nav-item')
    navItems.forEach(item => {
      const isActive = item.getAttribute('data-view') === view
      item.classList.toggle('bg-primary-100', isActive)
      item.classList.toggle('text-primary-700', isActive)
      item.classList.toggle('text-gray-600', !isActive)
      item.classList.toggle('hover:text-gray-900', !isActive)
      item.classList.toggle('hover:bg-gray-100', !isActive)
    })
  }
}
