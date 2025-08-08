/**
 * End-to-End Tests for Color Awesome
 * Tests complete user workflows and scenarios
 */

import { test, expect } from '@playwright/test'

test.describe('Color Awesome E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Color Converter Workflow', () => {
    test('should convert colors between formats', async ({ page }) => {
      // Navigate to converter
      await page.click('nav button[data-view="converter"]')
      
      // Wait for converter to load
      await page.waitForSelector('.color-converter')
      
      // Test hex to RGB conversion
      await page.fill('#hex-input', '#ff0000')
      
      // Verify RGB values are updated
      await expect(page.locator('#rgb-r')).toHaveValue('255')
      await expect(page.locator('#rgb-g')).toHaveValue('0')
      await expect(page.locator('#rgb-b')).toHaveValue('0')
      
      // Test RGB to hex conversion
      await page.fill('#rgb-r', '0')
      await page.fill('#rgb-g', '255')
      await page.fill('#rgb-b', '0')
      
      // Verify hex value is updated
      await expect(page.locator('#hex-input')).toHaveValue('#00ff00')
    })

    test('should save color to collection', async ({ page }) => {
      await page.click('nav button[data-view="converter"]')
      await page.fill('#hex-input', '#3b82f6')
      
      // Save color
      await page.click('#save-color')
      
      // Add color name
      await page.fill('.color-name-input', 'Primary Blue')
      await page.click('.confirm-save-btn')
      
      // Verify success toast
      await expect(page.locator('.toast-item')).toContainText('Color saved')
      
      // Navigate to collection and verify
      await page.click('nav button[data-view="collection"]')
      await expect(page.locator('.color-item')).toContainText('Primary Blue')
    })

    test('should copy color to clipboard', async ({ page }) => {
      await page.click('nav button[data-view="converter"]')
      await page.fill('input[type="color"]', '#ff6b35')
      
      // Grant clipboard permissions
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
      
      // Copy color
      await page.click('#copy-hex')
      
      // Verify clipboard content
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
      expect(clipboardText).toBe('#ff6b35')
      
      // Verify success toast
      await expect(page.locator('.toast-item')).toContainText('Copied')
    })
  })

  test.describe('Image Color Picker Workflow', () => {
    test('should upload and analyze image', async ({ page }) => {
      await page.click('nav button[data-view="image-picker"]')
      await page.waitForSelector('.image-picker')
      
      // Upload test image
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg')
      
      // Wait for image to load
      await page.waitForSelector('#image-canvas')
      await expect(page.locator('#image-canvas')).toBeVisible()
      
      // Extract dominant colors
      await page.click('#extract-dominant')
      await page.waitForSelector('.dominant-colors')
      
      // Verify colors are extracted
      const colorSwatches = page.locator('.extracted-color-tile')
      await expect(colorSwatches).toHaveCount.greaterThan(0)
    })

    test('should pick color from image', async ({ page }) => {
      await page.click('nav button[data-view="image-picker"]')
      await page.locator('input[type="file"]').setInputFiles('./tests/fixtures/test-image.jpg')
      await page.waitForSelector('#image-canvas')
      
      // Click on image to pick color
      await page.click('#image-canvas', { position: { x: 100, y: 100 } })
      
      // Verify color preview is shown
      await expect(page.locator('.picked-color-preview')).toBeVisible()
      
      // Verify hex value is displayed
      const hexValue = page.locator('.picked-color-hex')
      await expect(hexValue).toContainText('#')
    })

    test('should use eyedropper mode', async ({ page }) => {
      await page.click('nav button[data-view="image-picker"]')
      await page.locator('input[type="file"]').setInputFiles('./tests/fixtures/test-image.jpg')
      
      // Enable eyedropper mode
      await page.click('#toggle-eyedropper')
      // The app toggles button state; verify zoom/interaction instead
      
      // Pick color in eyedropper mode
      await page.click('#image-canvas', { position: { x: 150, y: 150 } })
      
      // Verify precision picking
      await expect(page.locator('.eyedropper-coordinates')).toBeVisible()
    })

    test('should zoom in and out', async ({ page }) => {
      await page.click('nav button[data-view="image-picker"]')
      await page.locator('input[type="file"]').setInputFiles('./tests/fixtures/test-image.jpg')
      
      // Zoom in
      await page.click('#zoom-in')
      const zoomLevel = page.locator('.zoom-level')
      await expect(zoomLevel).toContainText('110%')
      
      // Zoom out
      await page.click('#zoom-out')
      await expect(zoomLevel).toContainText('100%')
      
      // Reset zoom
      await page.click('#zoom-reset')
      await expect(zoomLevel).toContainText('100%')
    })
  })

  test.describe('Color Collection Workflow', () => {
    test('should display saved colors', async ({ page }) => {
      // Pre-populate with test data
      await page.evaluate(() => {
        const testColors = [
          { id: '1', hex: '#ff0000', name: 'Red', isFavorite: false, tags: ['primary'] },
          { id: '2', hex: '#00ff00', name: 'Green', isFavorite: true, tags: ['primary', 'nature'] },
          { id: '3', hex: '#0000ff', name: 'Blue', isFavorite: false, tags: ['primary', 'cool'] }
        ]
        localStorage.setItem('savedColors', JSON.stringify(testColors))
      })
      
      await page.reload()
      await page.click('nav button[data-view="collection"]')
      
      // Verify colors are displayed
      const colorItems = page.locator('.color-item')
      await expect(colorItems).toHaveCount(3)
      
      // Verify color names
      await expect(page.locator('.color-item').first()).toContainText('Red')
    })

    test('should filter by favorites', async ({ page }) => {
      // Pre-populate with test data
      await page.evaluate(() => {
        const testColors = [
          { id: '1', hex: '#ff0000', name: 'Red', isFavorite: false },
          { id: '2', hex: '#00ff00', name: 'Green', isFavorite: true }
        ]
        localStorage.setItem('savedColors', JSON.stringify(testColors))
      })
      
      await page.reload()
      await page.click('nav button[data-view="collection"]')
      
      // Apply favorites filter
      await page.click('button[data-filter="favorites"]')
      
      // Verify only favorite colors are shown
      const visibleItems = page.locator('.color-item:visible')
      await expect(visibleItems).toHaveCount(1)
      await expect(visibleItems).toContainText('Green')
    })

    test('should add and filter by tags', async ({ page }) => {
      await page.click('nav button[data-view="collection"]')
      
      // Add a color first
      await page.click('nav button[data-view="converter"]')
      await page.fill('input[type="color"]', '#purple')
      await page.click('.save-color-btn')
      await page.fill('.color-name-input', 'Purple')
      
      // Add tags
      await page.fill('.tags-input', 'secondary, cool')
      await page.click('.confirm-save-btn')
      
      // Go back to collection
      await page.click('nav button[data-view="collection"]')
      
      // Filter by tag
      await page.click('.tag-filter[data-tag="cool"]')
      
      // Verify filtering works
      await expect(page.locator('.color-item:visible')).toContainText('Purple')
    })

    test('should reorder colors with drag and drop', async ({ page }) => {
      // Pre-populate with test data
      await page.evaluate(() => {
        const testColors = [
          { id: '1', hex: '#ff0000', name: 'Red' },
          { id: '2', hex: '#00ff00', name: 'Green' }
        ]
        localStorage.setItem('savedColors', JSON.stringify(testColors))
      })
      
      await page.reload()
      await page.click('nav button[data-view="collection"]')
      
      // Enable organize mode
      await page.click('.organize-mode-btn')
      
      // Drag and drop (simulate)
      const firstItem = page.locator('.color-item').first()
      const secondItem = page.locator('.color-item').nth(1)
      
      await firstItem.dragTo(secondItem)
      
      // Verify order changed
      await expect(page.locator('.color-item').first()).toContainText('Green')
    })

    test('should search colors', async ({ page }) => {
      // Pre-populate with test data
      await page.evaluate(() => {
        const testColors = [
          { id: '1', hex: '#ff0000', name: 'Bright Red' },
          { id: '2', hex: '#00ff00', name: 'Forest Green' },
          { id: '3', hex: '#0000ff', name: 'Ocean Blue' }
        ]
        localStorage.setItem('savedColors', JSON.stringify(testColors))
      })
      
      await page.reload()
      await page.click('nav button[data-view="collection"]')
      
      // Search for colors
      await page.fill('.search-input', 'red')
      
      // Verify search results
      const visibleItems = page.locator('.color-item:visible')
      await expect(visibleItems).toHaveCount(1)
      await expect(visibleItems).toContainText('Bright Red')
    })
  })

  test.describe('Keyboard Shortcuts', () => {
    test('should navigate with number keys', async ({ page }) => {
      // Test navigation shortcuts
      await page.keyboard.press('1')
      await expect(page.locator('.color-converter')).toBeVisible()
      
      await page.keyboard.press('2')
      await expect(page.locator('.image-picker')).toBeVisible()
      
      await page.keyboard.press('3')
      await expect(page.locator('.color-collection')).toBeVisible()
    })

    test('should open command palette with Ctrl+K', async ({ page }) => {
      await page.keyboard.press('Control+k')
      
      // Verify command palette opens
      await expect(page.locator('#command-palette')).toBeVisible()
      await expect(page.locator('#command-palette input')).toBeFocused()
      
      // Close with escape
      await page.keyboard.press('Escape')
      await expect(page.locator('#command-palette')).not.toBeVisible()
    })

    test('should show shortcuts help with Ctrl+/', async ({ page }) => {
      await page.keyboard.press('Control+/')
      
      // Verify shortcuts help opens
      await expect(page.locator('#shortcuts-help')).toBeVisible()
      await expect(page.locator('#shortcuts-help')).toContainText('Keyboard Shortcuts')
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should show mobile navigation on small screens', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Verify mobile navigation is visible
      await expect(page.locator('.mobile-nav')).toBeVisible()
      
      // Test mobile navigation
      await page.click('.mobile-nav button[data-view="image-picker"]')
      await expect(page.locator('.image-picker')).toBeVisible()
    })

    test('should be touch-friendly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Verify touch targets are large enough (44px minimum)
      const buttons = page.locator('button')
      const count = await buttons.count()
      
      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i)
        const box = await button.boundingBox()
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44)
          expect(box.width).toBeGreaterThanOrEqual(44)
        }
      }
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      // Check for skip links
      await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main-content')
      
      // Check color swatches have proper labels
      const colorSwatches = page.locator('.color-swatch')
      const count = await colorSwatches.count()
      
      for (let i = 0; i < count; i++) {
        const swatch = colorSwatches.nth(i)
        await expect(swatch).toHaveAttribute('aria-label')
        await expect(swatch).toHaveAttribute('role', 'button')
      }
    })

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab')
      await expect(page.locator('.skip-link')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('nav button').first()).toBeFocused()
      
      // Test focus management in modals
      await page.keyboard.press('Control+k')
      await expect(page.locator('#command-palette input')).toBeFocused()
      
      // Tab should stay within modal
      await page.keyboard.press('Tab')
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })

    test('should work with screen readers', async ({ page }) => {
      // Check for proper heading structure
      await expect(page.locator('h1')).toContainText('Color Awesome')
      
      // Check for descriptive link text
      const links = page.locator('a')
      const count = await links.count()
      
      for (let i = 0; i < count; i++) {
        const link = links.nth(i)
        const text = await link.textContent()
        expect(text?.length).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const start = Date.now()
      await page.goto('http://localhost:3000')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - start
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('should handle large color collections efficiently', async ({ page }) => {
      // Create large dataset
      await page.evaluate(() => {
        const largeColorSet = Array.from({ length: 1000 }, (_, i) => ({
          id: `color-${i}`,
          hex: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
          name: `Color ${i}`,
          isFavorite: i % 10 === 0,
          tags: [`tag-${i % 5}`]
        }))
        localStorage.setItem('savedColors', JSON.stringify(largeColorSet))
      })
      
      await page.reload()
      await page.click('nav button[data-view="collection"]')
      
      // Should still be responsive
      const start = Date.now()
      await page.locator('.color-collection').waitFor()
      const renderTime = Date.now() - start
      
      expect(renderTime).toBeLessThan(2000)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle invalid image uploads gracefully', async ({ page }) => {
      await page.click('nav button[data-view="image-picker"]')
      
      // Try to upload invalid file
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('./tests/fixtures/invalid-file.txt')
      
      // Should show error message
      await expect(page.locator('.error-toast')).toContainText('Invalid file type')
    })

    test('should handle network errors', async ({ page }) => {
      // Simulate offline
      await page.context().setOffline(true)
      
      // Try to perform action that might require network
      await page.click('.share-color-btn')
      
      // Should show appropriate error
      await expect(page.locator('.error-toast')).toContainText('Network error')
      
      // Go back online
      await page.context().setOffline(false)
    })
  })

  test.describe('Data Persistence', () => {
    test('should persist colors across sessions', async ({ page }) => {
      // Save a color
      await page.click('nav button[data-view="converter"]')
      await page.fill('input[type="color"]', '#ff6b35')
      await page.click('.save-color-btn')
      await page.fill('.color-name-input', 'Orange')
      await page.click('.confirm-save-btn')
      
      // Reload page
      await page.reload()
      
      // Verify color is still there
      await page.click('nav button[data-view="collection"]')
      await expect(page.locator('.color-item')).toContainText('Orange')
    })

    test('should handle data migration', async ({ page }) => {
      // Set old format data
      await page.evaluate(() => {
        const oldFormatData = [
          { hex: '#ff0000', name: 'Red' }
        ]
        localStorage.setItem('savedColors', JSON.stringify(oldFormatData))
      })
      
      await page.reload()
      await page.click('nav button[data-view="collection"]')
      
      // Should still display colors (after migration)
      await expect(page.locator('.color-item')).toContainText('Red')
    })
  })
})
