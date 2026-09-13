const SUPABASE_TARGET = "https://tzhtpjsgpruagfusjsdr.supabase.co";

export default async (request, context) => {
  const url = new URL(request.url);
  const targetUrl = new URL(url.pathname + url.search, SUPABASE_TARGET);

  // Handle CORS preflight OPTIONS requests immediately
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, prefer, range",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Clone incoming headers and set Host to Supabase domain
  const headers = new Headers(request.headers);
  headers.set("host", "tzhtpjsgpruagfusjsdr.supabase.co");

  // Read request body for non-GET/HEAD methods
  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: body,
      redirect: "follow",
    });

    // Pass through response headers with wildcard CORS headers attached
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Headers", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Netlify Supabase Proxy Error", message: err.message }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};

export const config = {
  path: "/*",
};
