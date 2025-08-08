/**
 * Unit Tests for Color Conversion Functions
 * Tests all color format conversions and utility functions
 */

import { describe, it, expect, beforeEach } from 'vitest'

// Mock color conversion functions for testing
const ColorUtils = {
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },

  rgbToHex(r, g, b) {
    const toHex = (n) => {
      const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  },

  rgbToHsl(r, g, b) {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  },

  hslToRgb(h, s, l) {
    h = h / 360
    s = s / 100
    l = l / 100

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    let r, g, b

    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    }
  },

  rgbToHsv(r, g, b) {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    let h = 0
    const s = max === 0 ? 0 : diff / max
    const v = max

    if (diff !== 0) {
      switch (max) {
        case r: h = ((g - b) / diff) % 6; break
        case g: h = (b - r) / diff + 2; break
        case b: h = (r - g) / diff + 4; break
      }
      h *= 60
      if (h < 0) h += 360
    }

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    }
  },

  isValidHex(hex) {
    return /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(hex)
  },

  isValidRgb(r, g, b) {
    return [r, g, b].every(val => 
      typeof val === 'number' && val >= 0 && val <= 255
    )
  },

  getContrastRatio(color1, color2) {
    const luminance = (r, g, b) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const lum1 = luminance(color1.r, color1.g, color1.b)
    const lum2 = luminance(color2.r, color2.g, color2.b)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  }
}

describe('Color Conversion Functions', () => {
  describe('hexToRgb', () => {
    it('should convert valid hex colors to RGB', () => {
      expect(ColorUtils.hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(ColorUtils.hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(ColorUtils.hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 })
      expect(ColorUtils.hexToRgb('#3b82f6')).toEqual({ r: 59, g: 130, b: 246 })
    })

    it('should handle hex colors without # prefix', () => {
      expect(ColorUtils.hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(ColorUtils.hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('should return null for invalid hex colors', () => {
      expect(ColorUtils.hexToRgb('#GG0000')).toBeNull()
      expect(ColorUtils.hexToRgb('#FF00')).toBeNull()
      expect(ColorUtils.hexToRgb('invalid')).toBeNull()
    })
  })

  describe('rgbToHex', () => {
    it('should convert RGB values to hex', () => {
      expect(ColorUtils.rgbToHex(255, 0, 0)).toBe('#ff0000')
      expect(ColorUtils.rgbToHex(0, 255, 0)).toBe('#00ff00')
      expect(ColorUtils.rgbToHex(0, 0, 255)).toBe('#0000ff')
      expect(ColorUtils.rgbToHex(59, 130, 246)).toBe('#3b82f6')
    })

    it('should handle edge cases', () => {
      expect(ColorUtils.rgbToHex(0, 0, 0)).toBe('#000000')
      expect(ColorUtils.rgbToHex(255, 255, 255)).toBe('#ffffff')
    })

    it('should clamp values to valid range', () => {
      expect(ColorUtils.rgbToHex(-10, 300, 150)).toBe('#00ff96')
    })
  })

  describe('rgbToHsl', () => {
    it('should convert RGB to HSL', () => {
      const red = ColorUtils.rgbToHsl(255, 0, 0)
      expect(red.h).toBe(0)
      expect(red.s).toBe(100)
      expect(red.l).toBe(50)

      const white = ColorUtils.rgbToHsl(255, 255, 255)
      expect(white.h).toBe(0)
      expect(white.s).toBe(0)
      expect(white.l).toBe(100)

      const black = ColorUtils.rgbToHsl(0, 0, 0)
      expect(black.h).toBe(0)
      expect(black.s).toBe(0)
      expect(black.l).toBe(0)
    })
  })

  describe('hslToRgb', () => {
    it('should convert HSL to RGB', () => {
      const red = ColorUtils.hslToRgb(0, 100, 50)
      expect(red).toEqual({ r: 255, g: 0, b: 0 })

      const white = ColorUtils.hslToRgb(0, 0, 100)
      expect(white).toEqual({ r: 255, g: 255, b: 255 })

      const black = ColorUtils.hslToRgb(0, 0, 0)
      expect(black).toEqual({ r: 0, g: 0, b: 0 })
    })
  })

  describe('rgbToHsv', () => {
    it('should convert RGB to HSV', () => {
      const red = ColorUtils.rgbToHsv(255, 0, 0)
      expect(red.h).toBe(0)
      expect(red.s).toBe(100)
      expect(red.v).toBe(100)

      const white = ColorUtils.rgbToHsv(255, 255, 255)
      expect(white.h).toBe(0)
      expect(white.s).toBe(0)
      expect(white.v).toBe(100)
    })
  })

  describe('Validation Functions', () => {
    it('should validate hex colors', () => {
      expect(ColorUtils.isValidHex('#FF0000')).toBe(true)
      expect(ColorUtils.isValidHex('#fff')).toBe(true)
      expect(ColorUtils.isValidHex('FF0000')).toBe(true)
      expect(ColorUtils.isValidHex('#GG0000')).toBe(false)
      expect(ColorUtils.isValidHex('#FF00')).toBe(false)
    })

    it('should validate RGB values', () => {
      expect(ColorUtils.isValidRgb(255, 0, 0)).toBe(true)
      expect(ColorUtils.isValidRgb(0, 255, 255)).toBe(true)
      expect(ColorUtils.isValidRgb(-1, 0, 0)).toBe(false)
      expect(ColorUtils.isValidRgb(256, 0, 0)).toBe(false)
      expect(ColorUtils.isValidRgb('255', 0, 0)).toBe(false)
    })
  })

  describe('Accessibility Functions', () => {
    it('should calculate contrast ratios correctly', () => {
      const white = { r: 255, g: 255, b: 255 }
      const black = { r: 0, g: 0, b: 0 }
      
      const contrast = ColorUtils.getContrastRatio(white, black)
      expect(contrast).toBeCloseTo(21, 0) // Maximum contrast ratio

      const sameColor = ColorUtils.getContrastRatio(white, white)
      expect(sameColor).toBe(1) // Same color has 1:1 ratio
    })
  })

  describe('Round-trip Conversions', () => {
    it('should maintain color fidelity in RGB->HSL->RGB', () => {
      const original = { r: 120, g: 180, b: 240 }
      const hsl = ColorUtils.rgbToHsl(original.r, original.g, original.b)
      const converted = ColorUtils.hslToRgb(hsl.h, hsl.s, hsl.l)
      
      expect(Math.abs(converted.r - original.r)).toBeLessThanOrEqual(2)
      expect(Math.abs(converted.g - original.g)).toBeLessThanOrEqual(2)
      expect(Math.abs(converted.b - original.b)).toBeLessThanOrEqual(2)
    })

    it('should maintain color fidelity in RGB->Hex->RGB', () => {
      const original = { r: 59, g: 130, b: 246 }
      const hex = ColorUtils.rgbToHex(original.r, original.g, original.b)
      const converted = ColorUtils.hexToRgb(hex)
      
      expect(converted).toEqual(original)
    })
  })
})

describe('Edge Cases and Error Handling', () => {
  it('should handle extreme values gracefully', () => {
    expect(() => ColorUtils.rgbToHex(Infinity, 0, 0)).not.toThrow()
    expect(() => ColorUtils.rgbToHex(NaN, 0, 0)).not.toThrow()
    expect(() => ColorUtils.hexToRgb('')).not.toThrow()
  })

  it('should handle null and undefined inputs', () => {
    expect(ColorUtils.hexToRgb(null)).toBeNull()
    expect(ColorUtils.hexToRgb(undefined)).toBeNull()
  })
})
