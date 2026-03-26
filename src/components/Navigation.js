export class Navigation {
  constructor(currentView, onViewChange, options = {}) {
    this.currentView = currentView
    this.onViewChange = onViewChange
    this.tools = Array.isArray(options.tools) ? options.tools : []
    this.activeToolId = options.activeToolId || ''
    this.toolsExpanded = Boolean(options.toolsExpanded)
    this.onToolChange = typeof options.onToolChange === 'function' ? options.onToolChange : null
    this.onToolsExpandChange = typeof options.onToolsExpandChange === 'function'
      ? options.onToolsExpandChange
      : null
  }

  render() {
    const navElement = document.getElementById('navigation')
    if (!navElement) return

    const navItems = [
      {
        id: 'converter',
        label: 'Color Converter',
        icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M16 4l3 3-3 3M19 7H9a4 4 0 00-4 4v1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 20l-3-3 3-3M5 17h10a4 4 0 004-4v-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
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

    const toolsButtonClass = this.currentView === 'tools' ? 'nav-item-active' : 'nav-item-idle'
    const toolsItems = this.tools.map((tool) => {
      const isActive = this.currentView === 'tools' && this.activeToolId === tool.id
      const toolItemClass = isActive ? 'nav-tool-item nav-tool-item-active' : 'nav-tool-item nav-tool-item-idle'
      return `
        <button
          type="button"
          class="${toolItemClass}"
          data-tool-id="${tool.id}"
          title="${tool.name}"
        >
          ${tool.name}
        </button>
      `
    }).join('')

    navElement.innerHTML = `
      <div class="desktop-nav space-y-1">
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

        <div class="nav-tools-group">
          <div class="nav-tools-row relative">
            <button
              class="nav-item ${toolsButtonClass} pr-10"
              data-view="tools"
              aria-label="Open Tools"
              title="Tools"
            >
              <span class="nav-item-icon"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 6.5l3 3-7.5 7.5H7v-3l7.5-7.5z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 8l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M5 20h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
              <span class="nav-item-label">Tools</span>
            </button>
            <button
              type="button"
              class="nav-tools-toggle absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-7 w-7 rounded-md text-slate-600 hover:bg-slate-200/70"
              data-action="toggle-tools"
              aria-label="${this.toolsExpanded ? 'Collapse tools list' : 'Expand tools list'}"
              aria-expanded="${this.toolsExpanded ? 'true' : 'false'}"
              title="${this.toolsExpanded ? 'Collapse tools' : 'Expand tools'}"
            >
              ${this.toolsExpanded
                ? '<svg class="block h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
                : '<svg class="block h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
              }
            </button>
          </div>
          <div class="mt-2 ml-9 space-y-1 ${this.toolsExpanded ? '' : 'hidden'}">
            ${toolsItems}
          </div>
        </div>
      </div>
    `

    this.setupEventListeners()
  }

  setupEventListeners() {
    const navItems = document.querySelectorAll('.nav-item')
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view')
        if (view === 'tools' && !this.toolsExpanded && this.onToolsExpandChange) {
          this.onToolsExpandChange(true)
        }
        this.onViewChange(view)
      })
    })

    const toolToggle = document.querySelector('.nav-tools-toggle')
    if (toolToggle) {
      toolToggle.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!this.onToolsExpandChange) return
        this.onToolsExpandChange(!this.toolsExpanded)
      })
    }

    const toolItems = document.querySelectorAll('.nav-tool-item')
    toolItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        const toolId = e.currentTarget.getAttribute('data-tool-id')
        if (!toolId) return
        if (this.onToolChange) this.onToolChange(toolId)
      })
    })
  }

  setToolsContext(context = {}) {
    if (Array.isArray(context.tools)) {
      this.tools = context.tools
    }
    if (typeof context.activeToolId === 'string') {
      this.activeToolId = context.activeToolId
    }
    if (typeof context.toolsExpanded === 'boolean') {
      this.toolsExpanded = context.toolsExpanded
    }
    this.render()
  }

  updateActiveView(view) {
    this.currentView = view
    this.render()
  }
}
