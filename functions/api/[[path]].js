const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, X-Device-Id, X-Api-Key",
  "Access-Control-Max-Age": "86400"
};

export async function onRequest(context) {
  const { request, env, params } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const publicApiKey = env.PUBLIC_API_KEY || "";
  if (publicApiKey && request.headers.get("X-Api-Key") !== publicApiKey) {
    return jsonResponse({ ok: false, message: "Invalid or missing X-Api-Key." }, 401);
  }

  const gowaBaseUrl = trimSlash(env.GOWA_BASE_URL || "https://whatsapp.apps.tirupatihost.in");
  const basicAuth = firstBasicAuth(env.GOWA_BASIC_AUTH || env.APP_BASIC_AUTH || "");
  const deviceId = request.headers.get("X-Device-Id") || env.GOWA_DEVICE_ID || "official bharath";
  const path = normalizePath(params.path);

  // --- Special _env endpoint returns configured env vars (no auth needed) ---
  if (path === "_env") {
    return jsonResponse({
      ok: true,
      GOWA_DEVICE_ID: env.GOWA_DEVICE_ID || "official bharath",
      GOWA_BASE_URL: env.GOWA_BASE_URL || "",
      PUBLIC_API_KEY_SET: !!env.PUBLIC_API_KEY
    }, 200);
  }

  if (!basicAuth) {
    return jsonResponse({ ok: false, message: "Set GOWA_BASIC_AUTH or APP_BASIC_AUTH in Cloudflare Pages environment variables." }, 500);
  }

  const incomingUrl = new URL(request.url);
  const apiPath = normalizePath(params.path);
  const targetUrl = `${gowaBaseUrl}/${apiPath}${incomingUrl.search}`;
  const headers = buildForwardHeaders(request.headers, gowaBaseUrl, basicAuth, deviceId);

  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "manual"
  });

  const responseHeaders = new Headers(upstream.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    responseHeaders.set(key, value);
  }
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
}

function buildForwardHeaders(sourceHeaders, gowaBaseUrl, basicAuth, deviceId) {
  const headers = new Headers();
  const blocked = new Set([
    "authorization",
    "cf-connecting-ip",
    "cf-ipcountry",
    "cf-ray",
    "cf-visitor",
    "connection",
    "content-length",
    "host",
    "origin",
    "referer",
    "x-forwarded-for",
    "x-forwarded-host",
    "x-forwarded-proto",
    "x-real-ip"
  ]);

  sourceHeaders.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!blocked.has(lower) && !lower.startsWith("cf-")) {
      headers.set(key, value);
    }
  });

  headers.set("Authorization", `Basic ${btoa(basicAuth)}`);
  headers.set("X-Device-Id", deviceId);
  headers.set("Host", new URL(gowaBaseUrl).host);
  return headers;
}

function normalizePath(pathParam) {
  if (Array.isArray(pathParam)) {
    return pathParam.map(encodeURIComponent).join("/");
  }
  if (!pathParam) {
    return "";
  }
  return String(pathParam).replace(/^\/+/, "");
}

function jsonResponse(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
  });
}

function firstBasicAuth(value) {
  return value.split(",")[0].trim();
}

function trimSlash(value) {
  return value.replace(/\/+$/, "");
}