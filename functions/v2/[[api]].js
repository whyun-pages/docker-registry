export async function onRequest(context) {
  const request = context.request
  const url = new URL(request.url);
  const path = url.pathname;
  const originalHost = request.headers.get("host");
  const registryHost = "registry-1.docker.io";
  const headers = new Headers(request.headers);
  headers.set("host", registryHost);
  const registryUrl = `https://${registryHost}${path}`;
  const registryRequest = new Request(registryUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    // redirect: "manual",
    redirect: "follow",
  });
  const registryResponse = await fetch(registryRequest);
  let content = '';
  if (registryResponse.headers.get("content-type").indexOf('json') !== -1) {
    content = await registryResponse.json();
  }
  console.log(
    request.url, 
    registryResponse.status, 
    JSON.stringify(Object.fromEntries(new Map(registryResponse.headers))),
    content.toString(),
  );
  const responseHeaders = new Headers(registryResponse.headers);
  responseHeaders.set("access-control-allow-origin", originalHost);
  responseHeaders.set("access-control-allow-headers", "Authorization");
  return new Response(content || registryResponse.body, {
    status: registryResponse.status,
    statusText: registryResponse.statusText,
    headers: responseHeaders,
  });
}