import { getRegistryHost, HEADER_WWW_AUTHENTICATE } from '../common';

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const path = url.pathname;
  const originalHost = request.headers.get('host');
  const registryHost = getRegistryHost(context.env, originalHost);
  const headers = new Headers(request.headers);
  headers.set('host', registryHost);
  const registryUrl = `https://${registryHost}${path}`;
  const registryRequest = new Request(registryUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: 'follow',
  });
  const registryResponse = await fetch(registryRequest);
  let content = '';
  if (registryResponse.headers.get('content-type').indexOf('json') !== -1) {
    content = await registryResponse.clone().json();
  }

  console.log(
    request.url,
    registryResponse.status,
    headers.get('authorization'),
    JSON.stringify(Object.fromEntries(new Map(registryResponse.headers))),
    JSON.stringify(content),
  );
  const responseHeaders = new Headers(registryResponse.headers);
  responseHeaders.set('access-control-allow-origin', originalHost);
  responseHeaders.set('access-control-allow-headers', 'Authorization');
  const wwwAuth = responseHeaders.get(HEADER_WWW_AUTHENTICATE);
  if (wwwAuth && context.env.SELF_AUTH === 'true') {
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