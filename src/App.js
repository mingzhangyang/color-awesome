import { Navigation } from './components/Navigation.js'
import { MobileNavigation } from './components/MobileNavigation.js'
import { ColorConverter } from './components/ColorConverter.js'
import { ImageColorPicker } from './components/ImageColorPicker.js'
import { ColorCollection } from './components/ColorCollection.js'
import { KeyboardShortcuts } from './utils/KeyboardShortcuts.js'
import { UIEnhancements } from './utils/UIEnhancements.js'
import { PerformanceOptimizer } from './utils/PerformanceOptimizer.js'
import { AdComponent, refreshAdsOnNavigation } from './components/AdComponent.js'

export class App {
  constructor() {
    this.currentView = 'converter'
    this.appElement = document.getElementById('app')
    this.previousView = null
    this.isTransitioning = false
  }

  init() {
    this.initializeEnhancements()
    this.render()
    this.setupEventListeners()
  }

  initializeEnhancements() {
    // Initialize keyboard shortcuts
    this.keyboardShortcuts = new KeyboardShortcuts(this)
    
    // Initialize UI enhancements
    this.uiEnhancements = new UIEnhancements()
    
    // Initialize performance optimizer
    this.performanceOptimizer = new PerformanceOptimizer()
    
    // Add global accessibility improvements
    this.setupAccessibility()
  }

  setupAccessibility() {
    // Add focus trap for modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabNavigation(e)
      }
    })
    
    // Add focus indicators
    document.addEventListener('focusin', (e) => {
      if (e.target.matches('button, input, select, textarea, [tabindex]')) {
        e.target.classList.add('focus-ring')
      }
    })
    
    document.addEventListener('focusout', (e) => {
      e.target.classList.remove('focus-ring')
    })
  }

  handleTabNavigation(e) {
    const modal = document.querySelector('.modal:not(.hidden), [role="dialog"]:not(.hidden)')
    if (modal) {
      const focusableElements = modal.querySelectorAll(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  render() {
    // Create footer ad only
    const footerAd = AdComponent.create('footer')

    this.appElement.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg"></div>
                <h1 class="text-2xl font-bold text-gradient">Color Awesome</h1>
              </div>
              <nav id="navigation"></nav>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div id="main-content" class="animate-fade-in">
            <!-- Content will be injected here -->
          </div>
        </main>

        <!-- Footer -->
        <footer class="bg-white border-t border-gray-200 mt-16">
          <!-- Footer Ad -->
          ${footerAd.render()}
          
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="text-center text-gray-600 space-y-4">
              <p>&copy; 2025 Color Awesome. Built with ❤️ for color enthusiasts.</p>
              <div class="flex justify-center items-center space-x-6 text-sm">
                <a href="mailto:contact@orangely.xyz?subject=Color%20Awesome%20-%20Question" 
                   class="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1">
                  <span>📧</span>
                  <span>Contact Developer</span>
                </a>
                <span class="text-gray-300">|</span>
                <a href="https://github.com/mingzhangyang/color-awesome/issues" 
                   target="_blank" rel="noopener noreferrer"
                   class="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1">
                  <span>🐛</span>
                  <span>Report Issues</span>
                </a>
                <span class="text-gray-300">|</span>
                <a href="https://github.com/mingzhangyang/color-awesome" 
                   target="_blank" rel="noopener noreferrer"
                   class="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1">
                  <span>⭐</span>
                  <span>Star on GitHub</span>
                </a>
                <span class="text-gray-300">|</span>
                <a href="/privacy-policy.html" 
                   target="_blank" rel="noopener noreferrer"
                   class="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1">
                  <span>🔒</span>
                  <span>Privacy Policy</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    `

    this.initializeComponents()
  }

  initializeComponents() {
    // Initialize navigation
    const navigation = new Navigation(this.currentView, (view) => this.switchView(view))
    navigation.render()
    
    // Initialize mobile navigation
    this.mobileNavigation = new MobileNavigation(this.currentView, (view) => this.switchView(view))
    this.mobileNavigation.render()

    // Initialize ads
    this.initializeAds()

    // Initialize current view
    this.renderCurrentView()
  }

  initializeAds() {
    // Initialize all ads on the page
    setTimeout(() => {
      refreshAdsOnNavigation()
    }, 100)
  }

  renderCurrentView() {
    if (this.isTransitioning) return
    
    const contentElement = document.getElementById('main-content')
    const currentElement = contentElement.firstElementChild
    
    // Create new content container
    const newContent = document.createElement('div')
    newContent.className = 'view-content'
    
    this.isTransitioning = true
    
    // Show loading state
    if (this.uiEnhancements) {
      this.uiEnhancements.setLoading(contentElement, true)
    }
    
    // Simulate component initialization time
    setTimeout(() => {
      switch (this.currentView) {
        case 'converter':
          const converter = new ColorConverter()
          converter.render(newContent)
          break
        case 'image-picker':
          const imagePicker = new ImageColorPicker()
          imagePicker.render(newContent)
          break
        case 'collection':
          const collection = new ColorCollection()
          collection.render(newContent)
          break
        default:
          newContent.innerHTML = '<div class="text-center">View not found</div>'
      }
      
      // Remove loading state
      if (this.uiEnhancements) {
        this.uiEnhancements.setLoading(contentElement, false)
      }
      
      // Perform transition
      if (this.uiEnhancements) {
        this.uiEnhancements.transitionToView(
          currentElement, 
          newContent, 
          this.getTransitionDirection()
        ).then(() => {
          contentElement.innerHTML = ''
          contentElement.appendChild(newContent)
          
          // Enhance new content with animations and interactions
          if (this.uiEnhancements) {
            this.uiEnhancements.enhanceNewContent(newContent)
          }
          
          this.isTransitioning = false
        })
      } else {
        // Fallback without transitions
        contentElement.innerHTML = ''
        contentElement.appendChild(newContent)
        this.isTransitioning = false
      }
    }, 150) // Small delay for better UX
  }

  getTransitionDirection() {
    const viewOrder = ['converter', 'image-picker', 'collection']
    const currentIndex = viewOrder.indexOf(this.currentView)
    const previousIndex = viewOrder.indexOf(this.previousView)
    
    if (previousIndex === -1) return 'left'
    return currentIndex > previousIndex ? 'left' : 'right'
  }

  switchView(view) {
    if (this.isTransitioning || view === this.currentView) return
    
    this.previousView = this.currentView
    this.currentView = view
    this.renderCurrentView()
    
    // Update mobile navigation
    if (this.mobileNavigation) {
      this.mobileNavigation.updateActiveView(view)
    }
    
    // Refresh ads on view change
    refreshAdsOnNavigation()
    
    // Update URL without page reload (if using hash routing)
    if (window.location.hash !== `#${view}`) {
      window.history.pushState({ view }, '', `#${view}`)
    }
  }

  setupEventListeners() {
    // Global event listeners
    window.addEventListener('beforeunload', () => {
      // Save any pending data before page unload
      console.log('Saving data before page unload...')
    })
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.view) {
        this.previousView = this.currentView
        this.currentView = e.state.view
        this.renderCurrentView()
      }
    })
    
    // Handle hash changes for direct navigation
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1)
      const validViews = ['converter', 'image-picker', 'collection']
      if (validViews.includes(hash) && hash !== this.currentView) {
        this.switchView(hash)
      }
    })
    
    // Handle initial hash
    const initialHash = window.location.hash.slice(1)
    if (initialHash && ['converter', 'image-picker', 'collection'].includes(initialHash)) {
      this.currentView = initialHash
    }
    
    // Performance monitoring
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0]
          console.log(`Page load time: ${navigation.loadEventEnd - navigation.loadEventStart}ms`)
        }, 0)
      })
    }
    
    // Error handling
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error)
      if (this.uiEnhancements) {
        this.uiEnhancements.showToast('An error occurred. Please try again.', 'error')
      }
    })
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason)
      if (this.uiEnhancements) {
        this.uiEnhancements.showToast('An error occurred. Please try again.', 'error')
      }
      e.preventDefault()
    })
  }

  // Cleanup method for when the app is destroyed
  cleanup() {
    if (this.performanceOptimizer) {
      this.performanceOptimizer.cleanup()
    }
    
    // Log performance insights before cleanup
    if (this.performanceOptimizer) {
      const insights = this.performanceOptimizer.getPerformanceInsights()
      console.log('Performance Insights:', insights)
    }
  }

  // Method to get app health status
  getAppHealth() {
    const insights = this.performanceOptimizer?.getPerformanceInsights() || {}
    
    return {
      currentView: this.currentView,
      isTransitioning: this.isTransitioning,
      performanceInsights: insights,
      timestamp: new Date().toISOString()
    }
  }
}
