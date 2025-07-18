export class AdComponent {
  constructor(options = {}) {
    this.slot = options.slot || 'auto'
    this.format = options.format || 'auto'
    this.responsive = options.responsive !== false
    this.style = options.style || ''
    this.className = options.className || ''
    this.id = options.id || `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Renders the ad unit HTML
   * @returns {string} HTML string for the ad unit
   */
  render() {
    const adStyle = this.getAdStyle()
    const adClass = this.getAdClass()
    
    // For auto ads, we don't need data-ad-slot
    const slotAttribute = this.slot === 'auto' ? '' : `data-ad-slot="${this.slot}"`
    
    // Special handling for grid block ads
    if (this.className && this.className.includes('card')) {
      return `
        <div class="${adClass}" style="${this.style}">
          <ins class="adsbygoogle"
               style="display:block; width: 100%; height: 100%;"
               data-ad-client="ca-pub-6558783266514927"
               ${slotAttribute}
               data-ad-format="${this.format}"
               ${this.responsive ? 'data-full-width-responsive="true"' : ''}
               id="${this.id}">
          </ins>
        </div>
      `
    }
    
    return `
      <div class="ad-container ${adClass}" style="text-align: center; margin: 20px 0;">
        <ins class="adsbygoogle"
             style="display:block; ${adStyle}"
             data-ad-client="ca-pub-6558783266514927"
             ${slotAttribute}
             data-ad-format="${this.format}"
             ${this.responsive ? 'data-full-width-responsive="true"' : ''}
             id="${this.id}">
        </ins>
      </div>
    `
  }

  /**
   * Initializes the ad after it's been added to the DOM
   */
  init() {
    try {
      // Push the ad to AdSense queue
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
    } catch (error) {
      console.warn('AdSense initialization failed:', error)
    }
  }

  /**
   * Refreshes the ad (useful for SPA navigation)
   */
  refresh() {
    const adElement = document.getElementById(this.id)
    if (adElement) {
      // Remove existing ad
      adElement.innerHTML = ''
      
      // Re-initialize
      setTimeout(() => {
        this.init()
      }, 100)
    }
  }

  /**
   * Gets the appropriate CSS style for different ad formats
   * @returns {string} CSS style string
   */
  getAdStyle() {
    const baseStyle = this.style
    
    // Add responsive styles based on format
    switch (this.format) {
      case 'rectangle':
        return `width: 300px; height: 250px; ${baseStyle}`
      case 'leaderboard':
        return `width: 728px; height: 90px; ${baseStyle}`
      case 'banner':
        return `width: 320px; height: 50px; ${baseStyle}`
      case 'large-rectangle':
        return `width: 336px; height: 280px; ${baseStyle}`
      case 'mobile-banner':
        return `width: 320px; height: 50px; ${baseStyle}`
      case 'auto':
      default:
        return baseStyle
    }
  }

  /**
   * Gets appropriate CSS classes for styling
   * @returns {string} CSS class string
   */
  getAdClass() {
    let classes = ['ad-unit', this.className]
    
    // Add responsive classes
    if (this.responsive) {
      classes.push('responsive-ad')
    }
    
    // Add format-specific classes
    classes.push(`ad-format-${this.format}`)
    
    return classes.filter(Boolean).join(' ')
  }

  /**
   * Creates predefined ad configurations
   */
  static configs = {
    gridBlock: {
      slot: '8360975166', // Grid block ad slot ID
      format: 'rectangle',
      responsive: true,
      className: 'card',
      style: 'width: 300px; height: 250px; margin: 0; padding: 12px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 1px solid #e2e8f0;'
    },
    
    footer: {
      slot: '5801388298', // Footer ad slot ID
      format: 'auto',
      responsive: true,
      style: 'margin: 24px auto; max-width: 728px;'
    }
  }

  /**
   * Factory method to create predefined ad types
   * @param {string} type - The type of ad (headerBanner, sidebar, etc.)
   * @param {Object} overrides - Additional options to override defaults
   * @returns {AdComponent} Ad component instance
   */
  static create(type, overrides = {}) {
    const config = this.configs[type] || {}
    return new AdComponent({ ...config, ...overrides })
  }
}

/**
 * Utility function to initialize all ads on the page
 */
export function initializeAllAds() {
  try {
    if (window.adsbygoogle) {
      // Initialize only new, uninitialized ads
      const ads = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])')
      if (ads.length > 0) {
        console.log(`Initializing ${ads.length} new ads`)
        ads.forEach(ad => {
          try {
            window.adsbygoogle.push({})
          } catch (error) {
            console.warn('Failed to initialize individual ad:', error)
          }
        })
      }
    } else {
      console.warn('AdSense script not loaded yet')
    }
  } catch (error) {
    console.warn('Failed to initialize ads:', error)
  }
}

/**
 * Utility function to refresh ads when navigating in SPA
 */
export function refreshAdsOnNavigation() {
  // Clear any pending ad initialization timeouts
  if (window.adRefreshTimeout) {
    clearTimeout(window.adRefreshTimeout)
  }
  
  // Small delay to ensure DOM is ready, then initialize only new ads
  window.adRefreshTimeout = setTimeout(() => {
    initializeAllAds()
  }, 500)
}

/**
 * Utility function to clear all ads (useful for development/testing)
 */
export function clearAllAds() {
  const ads = document.querySelectorAll('.adsbygoogle')
  ads.forEach(ad => {
    ad.innerHTML = ''
    ad.removeAttribute('data-adsbygoogle-status')
    ad.removeAttribute('data-ad-status')
  })
  console.log(`Cleared ${ads.length} ads`)
}
