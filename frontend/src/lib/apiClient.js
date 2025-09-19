// src/lib/apiClient.js
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

// best-effort body parser: prefer JSON, then text, else null
async function parseResponse(res) {
  const ct = res.headers.get("content-type") || "";
  if (res.status === 204) return null;
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  // non-JSON fallback to plain text
  try {
    return await res.text();
  } catch {
    return null;
  }
}

// generic fetch wrapper with FormData + JSON support and rich errors
async function request(path, { method = "GET", headers = {}, body } = {}) {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  // only set JSON content type when not sending FormData
  const finalHeaders = isFormData
    ? headers
    : { "Content-Type": "application/json", ...headers };

  // stringify body unless it's already a string or FormData
  const finalBody =
    body === undefined
      ? undefined
      : isFormData
      ? body
      : typeof body === "string"
      ? body
      : JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: finalBody,
    });
  } catch (err) {
    // network-level failure (offline, CORS, DNS, etc.)
    const e = new Error("Network error. Please check your connection.");
    e.cause = err;
    throw e;
  }

  const data = await parseResponse(res);

  if (!res.ok) {
    // normalize common backend error shapes
    const msg =
      data?.error?.message ??
      data?.message ??
      (typeof data === "string" ? data : "Request failed");
    const error = new Error(msg || `HTTP ${res.status}`);
    error.status = res.status;
    error.field = data?.error?.field ?? null; // optional field-specific error
    error.raw = data;
    throw error;
  }

  return data;
}

// minimal HTTP client
export const apiClient = {
  get: (p) => request(p, { method: "GET" }),
  post: (p, body) => request(p, { method: "POST", body }),
  put: (p, body) => request(p, { method: "PUT", body }),
  delete: (p) => request(p, { method: "DELETE" }),
};
