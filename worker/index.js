/**
 * Color Awesome – Cloudflare Worker entry point
 *
 * Delegates all requests to the Workers Assets binding (env.ASSETS),
 * which serves the files from ./dist and handles the SPA fallback.
 *
 * To add custom server-side logic (API routes, custom headers, etc.),
 * intercept specific requests before the `env.ASSETS.fetch(request)` call.
 *
 * @see https://developers.cloudflare.com/workers/static-assets/
 */
export default {
    async fetch(request, env) {
        const response = await env.ASSETS.fetch(request)
        const url = new URL(request.url)
        const headers = new Headers(response.headers)

        this.applySecurityHeaders(headers)

        if (request.method === 'GET' || request.method === 'HEAD') {
            headers.set('Cache-Control', this.getCacheControl(url.pathname))
        }

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers
        })
    },

    getCacheControl(pathname) {
        const isImmutableAsset = /^\/assets\/.+-[A-Za-z0-9_-]{8,}\.(js|css|png|jpg|jpeg|svg|webp|avif|woff2?)$/.test(pathname)
        if (isImmutableAsset) {
            return 'public, max-age=31536000, immutable'
        }

        const isHtmlLikeRoute = (
            pathname === '/' ||
            pathname === '/convert' ||
            pathname === '/hex-to-rgb' ||
            pathname === '/contrast-checker' ||
            pathname === '/image-picker' ||
            pathname === '/collection' ||
            pathname === '/palette' ||
            pathname.endsWith('.html')
        )

        if (isHtmlLikeRoute) {
            return 'public, max-age=0, must-revalidate'
        }

        if (pathname.endsWith('.xml') || pathname.endsWith('.txt')) {
            return 'public, max-age=3600'
        }

        return 'public, max-age=86400'
    },

    applySecurityHeaders(headers) {
        headers.set('X-Content-Type-Options', 'nosniff')
        headers.set('X-Frame-Options', 'DENY')
        headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
        headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
        headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }
}
