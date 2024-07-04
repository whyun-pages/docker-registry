import { 
    getRegistryHost, 
    HEADER_WWW_AUTHENTICATE, 
    HEADER_AUTHORIZATION,
    BEARER,
    checkWhiteList,
} from '../common';

// https://kevinfeng.github.io/post/docker-registry-authentication/
// https://distribution.github.io/distribution/spec/auth/token/
/**
 * Parses the WWW-Authenticate header and extracts the realm, service, and scope.
 *
 * @param {string} wwwAuth - The value of the WWW-Authenticate header.
 * @returns {Object} An object containing the extracted realm, service, and scope.
 * @throws Will throw an error if the WWW-Authenticate header is not in the expected format.
 */
function getAuthConfig(wwwAuth) {
    if (wwwAuth.startsWith(BEARER)) {
        wwwAuth = wwwAuth.substring(BEARER.length);
    }
    const m = new Map();
    wwwAuth.split(',').forEach((kv) => {
        const [key, value] = kv.split('=');
        m.set(key, (value || '').replace(/^"|"$/g, ''));
    });

    return {
        realm: m.get('realm'),
        service: m.get('service'),
    };
}
export async function onRequest(context) {
    const request = context.request;
    const originalHost = request.headers.get('host');
    if (context.env.WHITE_LIST) {
        const authHeader = request.headers.get(HEADER_AUTHORIZATION);
        // console.log('auth header', authHeader, context.env.WHITE_LIST);
        if (!authHeader) {
            return new Response('Unauthorized', {status: 401});
        }
        if (!checkWhiteList(authHeader, context.env.WHITE_LIST.split(','))) {
            return new Response('Unauthorized', {status: 403});
        }
    }
    const registryHost = getRegistryHost(context.env, originalHost);
    const headers = new Headers(request.headers);
    headers.set('host', registryHost);
    const registryUrl = `https://${registryHost}/v2/`;
    const registryRequest = new Request(registryUrl, {
        method: request.method,
        headers: headers,
        body: request.body,
        redirect: 'follow',
    });
    const registryResponse = await fetch(registryRequest);

    if (registryResponse.status !== 401) {//auth success
        console.log('auth already success');
        return registryResponse;
    }
    // 重新鉴权
    const wwwAuth = registryResponse.headers.get(HEADER_WWW_AUTHENTICATE);
    const {realm, service} = getAuthConfig(wwwAuth);
    const authUrl = new URL(realm);
    if (service) {
        authUrl.searchParams.set('service', service);
    }
    const originalUrl = new URL(request.url);
    const scope = originalUrl.searchParams.get('scope');
    if (scope) {
        authUrl.searchParams.set('scope', scope);
    }

    const authRequest = new Request(authUrl, {
        method: 'GET',
        headers: headers,
        redirect: 'follow',
    });
    const authResponse = await fetch(authRequest);

    return authResponse;
}