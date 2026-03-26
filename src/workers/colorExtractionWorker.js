function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((value) => {
    const safe = Math.max(0, Math.min(255, Math.round(value)))
    const hex = safe.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }).join('')
}

function rgbToHsl(r, g, b) {
  let rr = r / 255
  let gg = g / 255
  let bb = b / 255

  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const diff = max - min
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)

    switch (max) {
      case rr:
        h = (gg - bb) / diff + (gg < bb ? 6 : 0)
        break
      case gg:
        h = (bb - rr) / diff + 2
        break
      default:
        h = (rr - gg) / diff + 4
    }

    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function extractDominantColors({ pixels, limit = 8 }) {
  const colorMap = new Map()
  const step = 4

  for (let i = 0; i < pixels.length; i += 4 * step) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const a = pixels[i + 3]

    if (a < 128) continue

    const clusteredR = Math.round(r / 16) * 16
    const clusteredG = Math.round(g / 16) * 16
    const clusteredB = Math.round(b / 16) * 16
    const key = `${clusteredR},${clusteredG},${clusteredB}`

    if (colorMap.has(key)) {
      const current = colorMap.get(key)
      current.count += 1
    } else {
      colorMap.set(key, { count: 1, r: clusteredR, g: clusteredG, b: clusteredB })
    }
  }

  return Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((color) => ({
      ...color,
      hex: rgbToHex(color.r, color.g, color.b)
    }))
}

function generatePalette({ pixels, limit = 6 }) {
  const colorMap = new Map()

  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const a = pixels[i + 3]
    if (a < 128) continue

    const hsl = rgbToHsl(r, g, b)
    const hueGroup = Math.floor(hsl.h / 30) * 30
    const key = `${hueGroup}-${Math.floor(hsl.s / 20)}-${Math.floor(hsl.l / 20)}`

    if (colorMap.has(key)) {
      const existing = colorMap.get(key)
      const nextCount = existing.count + 1
      colorMap.set(key, {
        count: nextCount,
        r: Math.round((existing.r * existing.count + r) / nextCount),
        g: Math.round((existing.g * existing.count + g) / nextCount),
        b: Math.round((existing.b * existing.count + b) / nextCount),
        hue: hueGroup
      })
    } else {
      colorMap.set(key, { count: 1, r, g, b, hue: hueGroup })
    }
  }

  const hueGroups = new Map()
  Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .forEach((color) => {
      if (!hueGroups.has(color.hue) && hueGroups.size < limit) {
        hueGroups.set(color.hue, color)
      }
    })

  const chosen = [...hueGroups.values()]
  const filler = Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .filter((color) => !chosen.includes(color))
    .slice(0, Math.max(0, limit - chosen.length))

  return [...chosen, ...filler].map((color) => ({
    ...color,
    hex: rgbToHex(color.r, color.g, color.b)
  }))
}

self.addEventListener('message', (event) => {
  const { id, task, payload } = event.data || {}

  if (!id || !task || !payload?.pixels) {
    self.postMessage({ id, error: 'Invalid worker payload.' })
    return
  }

  try {
    const pixels = payload.pixels instanceof Uint8ClampedArray
      ? payload.pixels
      : new Uint8ClampedArray(payload.pixels)

    const workPayload = {
      ...payload,
      pixels
    }

    let colors = []
    if (task === 'extractDominant') {
      colors = extractDominantColors(workPayload)
    } else if (task === 'generatePalette') {
      colors = generatePalette(workPayload)
    } else {
      throw new Error(`Unsupported worker task: ${task}`)
    }

    self.postMessage({ id, colors })
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : 'Worker task failed.'
    })
  }
})
