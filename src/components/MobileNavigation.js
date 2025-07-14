/**
 * Mobile Navigation Component
 * Provides touch-optimized navigation for mobile devices
 */

export class MobileNavigation {
  constructor(currentView, onViewChange) {
    this.currentView = currentView
    this.onViewChange = onViewChange
  }

  render() {
    // Remove existing mobile nav if present
    const existingNav = document.querySelector('.mobile-nav')
    if (existingNav) {
      existingNav.remove()
    }

    const mobileNav = document.createElement('nav')
    mobileNav.className = 'mobile-nav'
    mobileNav.innerHTML = this.getNavHTML()

    document.body.appendChild(mobileNav)
    this.setupEventListeners(mobileNav)
  }

  getNavHTML() {
    const navItems = [
      {
        id: 'converter',
        label: 'Convert',
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
        </svg>`
      },
      {
        id: 'image-picker',
        label: 'Pick',
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>`
      },
      {
        id: 'collection',
        label: 'Colors',
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>`
      }
    ]

    return navItems.map(item => `
      <button 
        class="mobile-nav-item ${item.id === this.currentView ? 'active' : ''}" 
        data-view="${item.id}"
        aria-label="Switch to ${item.label}"
      >
        ${item.icon}
        <span class="mt-1">${item.label}</span>
      </button>
    `).join('')
  }

  setupEventListeners(navElement) {
    navElement.addEventListener('click', (e) => {
      const navItem = e.target.closest('.mobile-nav-item')
      if (navItem) {
        const view = navItem.dataset.view
        this.setActiveView(view)
        this.onViewChange(view)
        
        // Add haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      }
    })

    // Add touch feedback
    navElement.addEventListener('touchstart', (e) => {
      const navItem = e.target.closest('.mobile-nav-item')
      if (navItem) {
        navItem.classList.add('bg-gray-100')
      }
    })

    navElement.addEventListener('touchend', (e) => {
      const navItem = e.target.closest('.mobile-nav-item')
      if (navItem) {
        navItem.classList.remove('bg-gray-100')
      }
    })
  }

  setActiveView(view) {
    this.currentView = view
    
    // Update active states
    const navItems = document.querySelectorAll('.mobile-nav-item')
    navItems.forEach(item => {
      item.classList.remove('active')
      if (item.dataset.view === view) {
        item.classList.add('active')
      }
    })
  }

  // Update mobile nav when view changes
  updateActiveView(view) {
    this.setActiveView(view)
  }
}
