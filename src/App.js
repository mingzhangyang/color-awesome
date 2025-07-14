import { Navigation } from './components/Navigation.js'
import { ColorConverter } from './components/ColorConverter.js'
import { ImageColorPicker } from './components/ImageColorPicker.js'
import { ColorCollection } from './components/ColorCollection.js'

export class App {
  constructor() {
    this.currentView = 'converter'
    this.appElement = document.getElementById('app')
  }

  init() {
    this.render()
    this.setupEventListeners()
  }

  render() {
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
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="text-center text-gray-600">
              <p>&copy; 2025 Color Awesome. Built with ❤️ for color enthusiasts.</p>
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

    // Initialize current view
    this.renderCurrentView()
  }

  renderCurrentView() {
    const contentElement = document.getElementById('main-content')
    
    switch (this.currentView) {
      case 'converter':
        const converter = new ColorConverter()
        converter.render(contentElement)
        break
      case 'image-picker':
        const imagePicker = new ImageColorPicker()
        imagePicker.render(contentElement)
        break
      case 'collection':
        const collection = new ColorCollection()
        collection.render(contentElement)
        break
      default:
        contentElement.innerHTML = '<div class="text-center">View not found</div>'
    }
  }

  switchView(view) {
    this.currentView = view
    this.renderCurrentView()
  }

  setupEventListeners() {
    // Global event listeners can go here
    window.addEventListener('beforeunload', () => {
      // Save any pending data before page unload
      console.log('Saving data before page unload...')
    })
  }
}
