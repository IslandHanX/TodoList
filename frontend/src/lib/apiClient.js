// src/lib/apiClient.js
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

/** 解析响应体：优先 JSON，其次 text，最后 null */
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
  // 非 JSON 的情况作为文本兜底
  try {
    return await res.text();
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", headers = {}, body } = {}) {
  // 是否是 FormData（例如上传图片时）
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  // 只有在不是 FormData 时才默认加 JSON 的 Content-Type
  const finalHeaders = isFormData
    ? headers
    : { "Content-Type": "application/json", ...headers };

  // 只有非 FormData 才 JSON.stringify
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
    // 网络错误（断网、CORS、服务器不可达等）
    const e = new Error("Network error. Please check your connection.");
    e.cause = err;
    throw e;
  }

  const data = await parseResponse(res);

  if (!res.ok) {
    // 尽量从多种后端格式读取 message
    const msg =
      data?.error?.message ??
      data?.message ??
      (typeof data === "string" ? data : "Request failed");
    const error = new Error(msg || `HTTP ${res.status}`);
    error.status = res.status;
    error.field = data?.error?.field ?? null; // 如果后端返回具体字段（如 'title'）
    error.raw = data;
    throw error;
  }

  return data;
}

export const apiClient = {
  get: (p) => request(p, { method: "GET" }),
  post: (p, body) => request(p, { method: "POST", body }),
  put: (p, body) => request(p, { method: "PUT", body }),
  delete: (p) => request(p, { method: "DELETE" }),
};
