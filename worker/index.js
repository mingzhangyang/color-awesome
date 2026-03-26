/**
 * Color Awesome Worker entry point.
 *
 * Strategy:
 * 1) Serve static assets via env.ASSETS.
 * 2) For deep links, if asset lookup returns 404 for an HTML navigation,
 *    fall back to /index.html.
 * 3) Apply response headers without turning header decoration problems into 500s.
 */
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

function getCacheControl(pathname) {
    if (IMMUTABLE_ASSET_PATH_RE.test(pathname)) {
        return 'public, max-age=31536000, immutable'
    }

    if (
        pathname === '/' ||
        pathname === '/convert' ||
        pathname === '/hex-to-rgb' ||
        pathname === '/contrast-checker' ||
        pathname === '/image-picker' ||
        pathname === '/collection' ||
        pathname === '/palette' ||
        pathname === '/tools' ||
        pathname.startsWith('/tools/') ||
        pathname.endsWith('.html')
    ) {
        return 'public, max-age=0, must-revalidate'
    }

    if (pathname.endsWith('.xml') || pathname.endsWith('.txt')) {
        return 'public, max-age=3600'
    }

    return 'public, max-age=86400'
}

function shouldServeSpaFallback(request, response) {
    if (!response || response.status !== 404) return false
    if (request.method !== 'GET' && request.method !== 'HEAD') return false
    const accept = request.headers.get('Accept') || ''
    return accept.includes('text/html')
}

async function fetchSpaFallback(request, env) {
    const url = new URL(request.url)
    const indexUrl = new URL('/index.html', url.origin)
    const indexRequest = new Request(indexUrl.toString(), {
        method: request.method
    })
    return env.ASSETS.fetch(indexRequest)
}

function withResponseHeaders(response, pathname, method) {
    const headers = new Headers(response.headers)
    applySecurityHeaders(headers)

    if (method === 'GET' || method === 'HEAD') {
        headers.set('Cache-Control', getCacheControl(pathname))
    }

    try {
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('Response header decoration failed, returning original response', {
            pathname,
            method,
            message
        })
        return response
    }
}

function createInternalErrorResponse() {
    const headers = new Headers({
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store'
    })
    applySecurityHeaders(headers)
    return new Response('Internal Server Error', { status: 500, headers })
}

export default {
    async fetch(request, env) {
        if (!hasAssetsBinding(env)) {
            return createInternalErrorResponse()
        }

        const url = new URL(request.url)

        try {
            let response = await env.ASSETS.fetch(request)

            if (shouldServeSpaFallback(request, response)) {
                response = await fetchSpaFallback(request, env)
            }

            return withResponseHeaders(response, url.pathname, request.method)
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            console.error('Worker request failed', {
                method: request.method,
                pathname: url.pathname,
                message
            })

            // Last attempt: fetch root index for HTML navigation
            try {
                if (request.method === 'GET' || request.method === 'HEAD') {
                    const rootUrl = new URL('/', url.origin)
                    const rootRequest = new Request(rootUrl.toString(), { method: request.method })
                    const rootResponse = await env.ASSETS.fetch(rootRequest)
                    return withResponseHeaders(rootResponse, '/', request.method)
                }
            } catch {
                // Ignore and return final 500 below.
            }

            return createInternalErrorResponse()
        }
    }
}
