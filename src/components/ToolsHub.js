import { DEFAULT_TOOL_ID, findToolById } from './toolsRegistry.js'

export class ToolsHub {
  constructor(options = {}) {
    this.container = null
    this.activeToolId = findToolById(options.initialToolId)?.id || DEFAULT_TOOL_ID
  }

  render(container) {
    if (!container) return

    this.container = container
    this.renderContent()
  }

  renderContent() {
    if (!this.container) return

    const activeTool = findToolById(this.activeToolId) || findToolById(DEFAULT_TOOL_ID)
    const iframeSrc = activeTool?.path || '/'
    const toolName = activeTool?.name || 'Tool'
    const toolDescription = activeTool?.description || ''

    this.container.innerHTML = `
      <section class="space-y-5">
        <header class="space-y-1">
          <h2 class="text-2xl font-semibold text-slate-900">${toolName}</h2>
          <p class="text-sm text-slate-600">${toolDescription}</p>
        </header>

        <article class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div class="flex items-center justify-end gap-3 border-b border-slate-100 px-4 py-3">
            <a
              href="${iframeSrc}"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Open in New Tab
            </a>
          </div>
          <div class="bg-slate-50 p-2 sm:p-3">
            <iframe
              src="${iframeSrc}"
              title="${toolName}"
              class="w-full rounded-lg border border-slate-200 bg-white"
              style="min-height: 78vh;"
              loading="lazy"
            ></iframe>
          </div>
        </article>
      </section>
    `
  }
}
