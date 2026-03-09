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
        return env.ASSETS.fetch(request)
    }
}
