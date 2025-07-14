/**
 * Loading States and Micro-interactions Manager
 * Handles loading states, transitions, and user feedback
 */

export class UIEnhancements {
  constructor() {
    this.loadingStates = new Map()
    this.init()
  }

  init() {
    this.setupGlobalStyles()
    this.initializeAnimations()
    this.setupIntersectionObserver()
  }

  setupGlobalStyles() {
    // Inject additional CSS for animations and loading states
    const style = document.createElement('style')
    style.textContent = `
      /* Loading States */
      .loading {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
      }

      .loading::after {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }

      .loading::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        border: 2px solid #e5e7eb;
        border-top: 2px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        z-index: 11;
      }

      @keyframes spin {
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }

      /* Skeleton Loading */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
      }

      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Micro-interactions */
      .btn-press {
        transform: scale(0.95);
        transition: transform 0.1s ease;
      }

      .hover-lift {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .hover-lift:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      }

      .color-transition {
        transition: background-color 0.3s ease, border-color 0.3s ease;
      }

      /* Enhanced Animations */
      .animate-fade-in-up {
        animation: fadeInUp 0.5s ease-out;
      }

      .animate-slide-in-left {
        animation: slideInLeft 0.4s ease-out;
      }

      .animate-slide-in-right {
        animation: slideInRight 0.4s ease-out;
      }

      .animate-bounce-in {
        animation: bounceIn 0.6s ease-out;
      }

      .animate-pulse-slow {
        animation: pulse 2s infinite;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes bounceIn {
        0% {
          opacity: 0;
          transform: scale(0.3);
        }
        50% {
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Focus improvements */
      .focus-ring {
        focus-visible:outline-none;
        focus-visible:ring-2;
        focus-visible:ring-primary-500;
        focus-visible:ring-offset-2;
      }

      /* Loading shimmer effect */
      .shimmer {
        background: linear-gradient(90deg, 
          rgba(255,255,255,0) 0%, 
          rgba(255,255,255,0.8) 50%, 
          rgba(255,255,255,0) 100%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      /* Stagger animations */
      .stagger-children > * {
        animation-delay: calc(var(--stagger-delay, 0.1s) * var(--stagger-index, 0));
      }
    `
    document.head.appendChild(style)
  }

  initializeAnimations() {
    // Add stagger animation delays to elements
    this.setupStaggerAnimations()
    
    // Setup button press animations
    this.setupButtonAnimations()
    
    // Setup hover effects
    this.setupHoverEffects()
  }

  setupStaggerAnimations() {
    const staggerContainers = document.querySelectorAll('.stagger-children')
    staggerContainers.forEach(container => {
      const children = container.children
      Array.from(children).forEach((child, index) => {
        child.style.setProperty('--stagger-index', index)
      })
    })
  }

  setupButtonAnimations() {
    document.addEventListener('mousedown', (e) => {
      if (e.target.matches('button, .btn, [role="button"]')) {
        e.target.classList.add('btn-press')
      }
    })

    document.addEventListener('mouseup', (e) => {
      if (e.target.matches('button, .btn, [role="button"]')) {
        setTimeout(() => {
          e.target.classList.remove('btn-press')
        }, 100)
      }
    })
  }

  setupHoverEffects() {
    // Add hover-lift class to interactive elements
    const interactiveElements = document.querySelectorAll('.color-swatch, .card, .tool-button')
    interactiveElements.forEach(el => {
      if (!el.classList.contains('hover-lift')) {
        el.classList.add('hover-lift')
      }
    })
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up')
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    })

    // Observe elements that should animate in
    setTimeout(() => {
      const animatedElements = document.querySelectorAll('.card, .color-item, .tool-section')
      animatedElements.forEach(el => observer.observe(el))
    }, 100)
  }

  // Loading state management
  setLoading(element, isLoading = true, message = '') {
    if (typeof element === 'string') {
      element = document.querySelector(element)
    }
    
    if (!element) return

    if (isLoading) {
      element.classList.add('loading')
      this.loadingStates.set(element, { 
        originalContent: element.innerHTML,
        message 
      })
      
      if (message) {
        element.setAttribute('data-loading-message', message)
      }
    } else {
      element.classList.remove('loading')
      element.removeAttribute('data-loading-message')
      this.loadingStates.delete(element)
    }
  }

  // Enhanced loading with skeleton
  setSkeletonLoading(element, isLoading = true) {
    if (typeof element === 'string') {
      element = document.querySelector(element)
    }
    
    if (!element) return

    if (isLoading) {
      const skeleton = this.createSkeleton(element)
      element.innerHTML = skeleton
      element.classList.add('skeleton-container')
    } else {
      element.classList.remove('skeleton-container')
      // Content should be restored by the calling code
    }
  }

  createSkeleton(element) {
    const rect = element.getBoundingClientRect()
    const height = Math.max(rect.height, 20)
    
    return `
      <div class="space-y-2">
        <div class="skeleton h-4 rounded w-3/4"></div>
        <div class="skeleton h-4 rounded w-1/2"></div>
        <div class="skeleton h-${Math.ceil(height/16)} rounded w-full"></div>
      </div>
    `
  }

  // Progress bar for long operations
  showProgressBar(container, progress = 0) {
    let progressBar = container.querySelector('.progress-bar')
    
    if (!progressBar) {
      progressBar = document.createElement('div')
      progressBar.className = 'progress-bar w-full bg-gray-200 rounded-full h-2 mb-4'
      progressBar.innerHTML = `
        <div class="progress-fill bg-primary-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
      `
      container.insertBefore(progressBar, container.firstChild)
    }
    
    const fill = progressBar.querySelector('.progress-fill')
    fill.style.width = `${Math.min(100, Math.max(0, progress))}%`
    
    if (progress >= 100) {
      setTimeout(() => {
        progressBar.remove()
      }, 500)
    }
  }

  // Animated counter
  animateCounter(element, start, end, duration = 1000) {
    const range = end - start
    const increment = range / (duration / 16)
    let current = start
    
    const timer = setInterval(() => {
      current += increment
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end
        clearInterval(timer)
      }
      element.textContent = Math.round(current)
    }, 16)
  }

  // Toast notifications with animations
  showToast(message, type = 'info', duration = 3000) {
    const toastContainer = this.getToastContainer()
    
    const toast = document.createElement('div')
    toast.className = `
      toast-item mb-2 px-4 py-3 rounded-lg shadow-lg text-white transform translate-x-full
      transition-transform duration-300 ease-out max-w-sm
      ${this.getToastColor(type)}
    `
    
    toast.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          ${this.getToastIcon(type)}
          <span class="ml-2">${message}</span>
        </div>
        <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `
    
    toastContainer.appendChild(toast)
    
    // Trigger animation
    setTimeout(() => {
      toast.style.transform = 'translateX(0)'
    }, 10)
    
    // Auto-remove
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove()
        }
      }, 300)
    }, duration)
    
    return toast
  }

  getToastContainer() {
    let container = document.querySelector('#toast-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'toast-container'
      container.className = 'fixed top-4 right-4 z-50 max-w-sm'
      document.body.appendChild(container)
    }
    return container
  }

  getToastColor(type) {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500', 
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }
    return colors[type] || colors.info
  }

  getToastIcon(type) {
    const icons = {
      success: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`,
      error: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>`,
      warning: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`,
      info: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>`
    }
    return icons[type] || icons.info
  }

  // Smooth page transitions
  transitionToView(fromElement, toElement, direction = 'left') {
    return new Promise((resolve) => {
      const animations = {
        left: { out: 'animate-slide-out-left', in: 'animate-slide-in-right' },
        right: { out: 'animate-slide-out-right', in: 'animate-slide-in-left' },
        up: { out: 'animate-slide-out-up', in: 'animate-slide-in-down' },
        down: { out: 'animate-slide-out-down', in: 'animate-slide-in-up' }
      }
      
      const anim = animations[direction] || animations.left
      
      if (fromElement) {
        fromElement.classList.add(anim.out)
        setTimeout(() => {
          fromElement.style.display = 'none'
          fromElement.classList.remove(anim.out)
        }, 300)
      }
      
      setTimeout(() => {
        toElement.style.display = 'block'
        toElement.classList.add(anim.in)
        setTimeout(() => {
          toElement.classList.remove(anim.in)
          resolve()
        }, 300)
      }, fromElement ? 150 : 0)
    })
  }

  // Enhanced ripple effect for buttons
  addRippleEffect(element) {
    element.addEventListener('click', (e) => {
      const ripple = document.createElement('span')
      const rect = element.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `
      
      element.style.position = 'relative'
      element.style.overflow = 'hidden'
      element.appendChild(ripple)
      
      setTimeout(() => {
        ripple.remove()
      }, 600)
    })
  }

  // Initialize all enhancements for new content
  enhanceNewContent(container) {
    // Add stagger animations
    this.setupStaggerAnimations()
    
    // Add hover effects
    const interactiveElements = container.querySelectorAll('.color-swatch, .card, .tool-button')
    interactiveElements.forEach(el => {
      if (!el.classList.contains('hover-lift')) {
        el.classList.add('hover-lift')
      }
    })
    
    // Add ripple effects to buttons
    const buttons = container.querySelectorAll('button, .btn')
    buttons.forEach(button => {
      this.addRippleEffect(button)
    })
    
    // Setup intersection observer for new elements
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    
    const animatedElements = container.querySelectorAll('.card, .color-item, .tool-section')
    animatedElements.forEach(el => observer.observe(el))
  }
}
