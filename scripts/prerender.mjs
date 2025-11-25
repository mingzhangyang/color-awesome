import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { firefox } from 'playwright'

const distDir = path.join(process.cwd(), 'dist')
const origin = 'http://localhost'
const DEFAULT_TIMEOUT_MS = Number(process.env.PRERENDER_TIMEOUT_MS) || 45000
const strictMode = process.env.PRERENDER_STRICT === 'true'

const routes = [
  { hash: '', output: 'index.html', label: 'converter (default)' },
  { hash: '#image-picker', output: 'image-picker.html', label: 'image picker' },
  { hash: '#collection', output: 'collection.html', label: 'collection' }
]

async function prerenderRoute(page, route) {
  console.log(`Prerendering ${route.label}`)
  const urlWithHash = `${origin}/${route.hash}`
  await withTimeout(page.goto(urlWithHash, { waitUntil: 'domcontentloaded' }), 'Navigating to app')
  console.log(`Loaded ${route.label}`)
  await page.waitForSelector('#main-content .view-content', { timeout: 5000 }).catch(() => {})
  await page.waitForTimeout(400)

  const html = await page.content()
  const outputPath = path.join(distDir, 'prerender', route.output)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, html, 'utf-8')
  console.log(`✔ Prerendered ${route.label} -> dist/prerender/${route.output}`)
}

async function run() {
  console.log('Launching Firefox for prerender...')
  let browser
  try {
    browser = await withTimeout(firefox.launch({ headless: true }), 'Launching Firefox')
    console.log('Firefox launched, starting snapshots...')
  } catch (err) {
    const message = `Skipping prerender; Playwright could not launch (${err.message}). Set PRERENDER_STRICT=true to fail on errors.`
    console.warn(message)
    if (strictMode) {
      throw err
    }
    return
  }

  try {
    let page
    try {
      page = await withTimeout(browser.newPage(), 'Opening page')
    } catch (err) {
      const message = `Skipping prerender; browser page could not open (${err.message}). Set PRERENDER_STRICT=true to fail the build.`
      console.warn(message)
      if (strictMode) {
        throw err
      }
      return
    }

    // Serve built assets directly from disk without opening a local server.
    await page.route('**/*', async (routeHandler) => {
      const request = routeHandler.request()
      const url = new URL(request.url())

      if (url.origin !== origin) {
        return routeHandler.abort()
      }

      let filePath = url.pathname === '/' ? 'index.html' : url.pathname.slice(1)
      const targetPath = path.join(distDir, filePath)

      try {
        await routeHandler.fulfill({ path: targetPath })
      } catch {
        await routeHandler.fulfill({ status: 404, body: 'Not found' })
      }
    })

    // Quick smoke test to avoid long hangs in restricted environments.
    try {
      await withTimeout(page.goto(`${origin}/`, { waitUntil: 'domcontentloaded' }), 'Smoke navigation')
    } catch (err) {
      const message = `Skipping prerender; browser navigation failed (${err.message}). Set PRERENDER_STRICT=true to fail the build.`
      console.warn(message)
      if (strictMode) {
        throw err
      }
      return
    }

    for (const route of routes) {
      try {
        await prerenderRoute(page, route)
      } catch (routeError) {
        const message = `Prerender for ${route.label} failed: ${routeError.message}`
        if (strictMode) {
          throw routeError
        }
        console.warn(message)
        break
      }
    }
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('Prerender failed:', err)
  process.exitCode = 1
})

function withTimeout(promise, label, timeout = DEFAULT_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${timeout}ms`)), timeout)
    )
  ])
}
