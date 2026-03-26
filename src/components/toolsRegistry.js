export const TOOLS_REGISTRY = [
  {
    id: 'og-png-exporter',
    name: 'OG PNG Exporter',
    description: 'Generate social preview PNG cards from text and visual settings.',
    path: '/og-png-exporter.html'
  }
]

export const TOOL_IDS = new Set(TOOLS_REGISTRY.map((tool) => tool.id))
export const DEFAULT_TOOL_ID = TOOLS_REGISTRY[0]?.id || ''

export function findToolById(toolId) {
  return TOOLS_REGISTRY.find((tool) => tool.id === toolId) || null
}
