import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../../worker/index.js'

describe('worker fetch handler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('serves deep-link requests with cache and security headers', async () => {
    const request = new Request('https://color.orangely.xyz/convert?hex=%232c1e56', {
      headers: { Accept: 'text/html,application/xhtml+xml' }
    })
    const env = {
      ASSETS: {
        fetch: vi.fn().mockResolvedValue(new Response('<html>ok</html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }))
      }
    }

    const response = await worker.fetch(request, env)

    expect(response.status).toBe(200)
    expect(await response.text()).toContain('ok')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    expect(env.ASSETS.fetch).toHaveBeenCalledTimes(1)
  })

  it('falls back to /index.html on deep-link 404 for html navigation', async () => {
    const request = new Request('https://color.orangely.xyz/convert?hex=%232c1e56', {
      headers: { Accept: 'text/html,application/xhtml+xml' }
    })
    const assetsFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('Not Found', { status: 404 }))
      .mockResolvedValueOnce(new Response('<html>index</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }))

    const response = await worker.fetch(request, { ASSETS: { fetch: assetsFetch } })

    expect(response.status).toBe(200)
    expect(await response.text()).toContain('index')
    expect(assetsFetch).toHaveBeenCalledTimes(2)

    const fallbackRequest = assetsFetch.mock.calls[1][0]
    expect(fallbackRequest.url).toBe('https://color.orangely.xyz/index.html')
    expect(fallbackRequest.method).toBe('GET')
  })

  it('preserves HEAD method during SPA fallback', async () => {
    const request = new Request('https://color.orangely.xyz/convert', {
      method: 'HEAD',
      headers: { Accept: 'text/html' }
    })
    const assetsFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }))

    const response = await worker.fetch(request, { ASSETS: { fetch: assetsFetch } })

    expect(response.status).toBe(200)
    expect(assetsFetch).toHaveBeenCalledTimes(2)

    const fallbackRequest = assetsFetch.mock.calls[1][0]
    expect(fallbackRequest.url).toBe('https://color.orangely.xyz/index.html')
    expect(fallbackRequest.method).toBe('HEAD')
  })

  it('returns 404 without SPA fallback for non-html accept headers', async () => {
    const request = new Request('https://color.orangely.xyz/convert?hex=%232c1e56', {
      headers: { Accept: 'application/json' }
    })
    const assetsFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('Not Found', { status: 404 }))

    const response = await worker.fetch(request, { ASSETS: { fetch: assetsFetch } })

    expect(response.status).toBe(404)
    expect(assetsFetch).toHaveBeenCalledTimes(1)
  })

  it('returns 500 when asset fetch throws and root fallback also fails', async () => {
    const request = new Request('https://color.orangely.xyz/assets/main.js')
    const env = {
      ASSETS: {
        fetch: vi
          .fn()
          .mockRejectedValueOnce(new Error('asset lookup failed'))
          .mockRejectedValueOnce(new Error('root lookup failed'))
      }
    }

    const response = await worker.fetch(request, env)

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal Server Error')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })
})
