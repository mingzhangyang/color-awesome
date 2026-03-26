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
    const request = new Request('https://color.orangely.xyz/convert?hex=%232c1e56')
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

  it('falls back to /index.html when deep-link asset fetch fails', async () => {
    const request = new Request('https://color.orangely.xyz/convert?hex=%232c1e56')
    const assetsFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('asset lookup failed'))
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
  })

  it('returns 500 when non-html route fails and fallback is not applicable', async () => {
    const request = new Request('https://color.orangely.xyz/assets/main.js')
    const env = {
      ASSETS: {
        fetch: vi.fn().mockRejectedValue(new Error('asset lookup failed'))
      }
    }

    const response = await worker.fetch(request, env)

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal Server Error')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })
})
