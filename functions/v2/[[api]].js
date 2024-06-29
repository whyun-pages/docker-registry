import { getRegistryHost } from "../common";

export async function onRequest(context) {
  const request = context.request
  const url = new URL(request.url);
  const path = url.pathname;
  const originalHost = request.headers.get("host");
  const registryHost = getRegistryHost(context.env, originalHost);
  const headers = new Headers(request.headers);
  headers.set("host", registryHost);
  const registryUrl = `https://${registryHost}${path}`;
  const registryRequest = new Request(registryUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: "follow",
  });
  const registryResponse = await fetch(registryRequest);
  let content = '';
  if (registryResponse.headers.get("content-type").indexOf('json') !== -1) {
    content = await registryResponse.clone().json();
  }
  const wwwAuth = registryResponse.headers.get("www-authenticate");
  if (wwwAuth && context.env.SELF_AUTH === 'true') {
    headers.set(
      "www-authenticate", 
      wwwAuth.replace(
        /realm=\\\\"([^"]+)\\\\"/, 
        `realm=\\"${url.protocol}//${url.host}/v2/auth\\"`
      )
    );
  }
  console.log(
    request.url, 
    registryResponse.status, 
    JSON.stringify(Object.fromEntries(new Map(registryResponse.headers))),
    JSON.stringify(content),
  );
  const responseHeaders = new Headers(registryResponse.headers);
  responseHeaders.set("access-control-allow-origin", originalHost);
  responseHeaders.set("access-control-allow-headers", "Authorization");
  return new Response(registryResponse.body, {
    status: registryResponse.status,
    statusText: registryResponse.statusText,
    headers: responseHeaders,
  });
}