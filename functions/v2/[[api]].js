import {
  DOCKER_HUB_REGISTRY,
  getRegistryHost,
  HEADER_WWW_AUTHENTICATE,
  // getAmzDate,
} from '../common';

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const path = url.pathname;
  const originalHost = request.headers.get('host');
  const registryHost = getRegistryHost(context.env, originalHost);
  const headers = new Headers(request.headers);
  const isDockerHub = registryHost === DOCKER_HUB_REGISTRY;
  headers.set('host', registryHost);

  const registryUrl = `https://${registryHost}${path}`;
  let registryRequest = new Request(registryUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: isDockerHub ? 'manual' : 'follow',
  });
  const registryResponse = await fetch(registryRequest);
  if (registryResponse.status === 307 && isDockerHub) {
    const location = registryResponse.headers.get('location');
    registryRequest = new Request(location, {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'follow',
    });
  }
  const isDebug = context.env.DEBUG === 'true';
  
  if (isDebug) {
    const responseCloned = registryResponse.clone();
    let body = '';
    if (registryResponse.headers.get('content-type').includes('application')) {
      body = await responseCloned.text();
    }
    console.log(
      'req on',
      request.url,
      registryResponse.status,
      'req headers', JSON.stringify(Object.fromEntries(new Map(request.headers))),
      'res headers', JSON.stringify(Object.fromEntries(new Map(registryResponse.headers))),
      body,
    );
  }
  const responseHeaders = new Headers(registryResponse.headers);
  responseHeaders.set('access-control-allow-origin', originalHost);
  responseHeaders.set('access-control-allow-headers', 'Authorization');
  const wwwAuth = responseHeaders.get(HEADER_WWW_AUTHENTICATE);
  if (wwwAuth) {
    responseHeaders.set(
      HEADER_WWW_AUTHENTICATE, 
      wwwAuth.replace(
        /realm="([^"]+)"/, 
        `realm="${url.protocol}//${url.host}/v2/auth"`
      )
    );
  }
  return new Response(registryResponse.body, {
    status: registryResponse.status,
    statusText: registryResponse.statusText,
    headers: responseHeaders,
  });
}