/**
 * Color Awesome Worker entry point.
 *
 * Serve static files from ASSETS and keep direct deep links
 * (`/convert?hex=...`) resilient by handling edge exceptions.
 */
const HTML_ROUTE_PATHS = new Set([
    '/',
    '/convert',
    '/hex-to-rgb',
    '/contrast-checker',
    '/image-picker',
    '/collection',
    '/palette'
])

const IMMUTABLE_ASSET_PATH_RE = /^\/assets\/.+-[A-Za-z0-9_-]{8,}\.(js|css|png|jpg|jpeg|svg|webp|avif|woff2?)$/

function hasAssetsBinding(env) {
    return Boolean(env?.ASSETS && typeof env.ASSETS.fetch === 'function')
}

function applySecurityHeaders(headers) {
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
}

function isHtmlLikeRoute(pathname) {
    return HTML_ROUTE_PATHS.has(pathname) || pathname.endsWith('.html')
}

function getCacheControl(pathname) {
    if (IMMUTABLE_ASSET_PATH_RE.test(pathname)) {
        return 'public, max-age=31536000, immutable'
    }

    if (isHtmlLikeRoute(pathname)) {
        return 'public, max-age=0, must-revalidate'
    }

    if (pathname.endsWith('.xml') || pathname.endsWith('.txt')) {
        return 'public, max-age=3600'
    }

    return 'public, max-age=86400'
}

function withResponseHeaders(response, pathname, method) {
    const headers = new Headers(response?.headers)
    applySecurityHeaders(headers)

    if (method === 'GET' || method === 'HEAD') {
        headers.set('Cache-Control', getCacheControl(pathname))
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    })
}

function createInternalErrorResponse() {
    const headers = new Headers({
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store'
    })
    applySecurityHeaders(headers)
    return new Response('Internal Server Error', { status: 500, headers })
}

async function fetchAsset(request, env) {
    if (!hasAssetsBinding(env)) {
        throw new Error('Missing ASSETS binding')
    }
    return env.ASSETS.fetch(request)
}

async function trySpaFallback(request, env) {
    if (!hasAssetsBinding(env)) return null
    if (request.method !== 'GET' && request.method !== 'HEAD') return null

    const url = new URL(request.url)
    if (!isHtmlLikeRoute(url.pathname)) return null

    const fallbackUrl = new URL('/index.html', url.origin)
    const fallbackRequest = request.method === 'HEAD'
        ? new Request(fallbackUrl.toString(), { method: 'HEAD' })
        : fallbackUrl.toString()
    const fallbackResponse = await env.ASSETS.fetch(fallbackRequest)
    return withResponseHeaders(fallbackResponse, '/index.html', request.method)
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url)

        try {
            const response = await fetchAsset(request, env)
            return withResponseHeaders(response, url.pathname, request.method)
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            console.error('Worker request failed', {
                method: request.method,
                pathname: url.pathname,
                message
            })

            try {
                const fallbackResponse = await trySpaFallback(request, env)
                if (fallbackResponse) return fallbackResponse
            } catch (fallbackError) {
                const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
                console.error('Worker SPA fallback failed', {
                    method: request.method,
                    pathname: url.pathname,
                    message: fallbackMessage
                })
            }

            return createInternalErrorResponse()
        }
    }
}
