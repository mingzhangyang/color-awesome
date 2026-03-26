export class Navigation {
  constructor(currentView, onViewChange) {
    this.currentView = currentView
    this.onViewChange = onViewChange
  }

  render() {
    const navElement = document.getElementById('navigation')
    
    const navItems = [
      {
        id: 'converter',
        label: 'Color Converter',
        icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 4L6 11l7 7m5-14l-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      },
      {
        id: 'image-picker',
        label: 'Image Picker',
        icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><path d="M20 15l-4.2-4.2a1.2 1.2 0 00-1.7 0L8 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
      },
      {
        id: 'collection',
        label: 'My Colors',
        icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7.5A2.5 2.5 0 017.5 5h9A2.5 2.5 0 0119 7.5v9a2.5 2.5 0 01-2.5 2.5h-9A2.5 2.5 0 015 16.5v-9z" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 9.5h7M8.5 13h7M8.5 16.5h4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
      }
    ]

    navElement.innerHTML = `
      <div class="desktop-nav">
        ${navItems.map(item => `
          <button 
            class="nav-item ${
              this.currentView === item.id 
                ? 'nav-item-active' 
                : 'nav-item-idle'
            }"
            data-view="${item.id}"
            aria-label="Open ${item.label}"
            title="${item.label}"
          >
            <span class="nav-item-icon">${item.icon}</span>
            <span class="nav-item-label">${item.label}</span>
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
        this.onViewChange(view)
      })
    })
  }

  updateActiveView(view) {
    this.currentView = view
    const navItems = document.querySelectorAll('.nav-item')
    navItems.forEach(item => {
      const isActive = item.getAttribute('data-view') === view
      item.classList.toggle('nav-item-active', isActive)
      item.classList.toggle('nav-item-idle', !isActive)
    })
  }
}
