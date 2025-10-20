// Encapsula las llamadas HTTP, inyecta la API key y gestiona reintentos 401
export default class ApiClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl || "";
    this.apiKey =
      apiKey || localStorage.getItem("API_KEY") || "dev_key_change_me";
  }

  async request(path, options = {}) {
    // Construcción de URL absoluta
    let url =
      path.startsWith("http://") || path.startsWith("https://")
        ? path
        : `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

    const opts = { ...options };
    opts.headers = opts.headers || {};
    opts.credentials = opts.credentials || "include";
    const method = (opts.method || "GET").toUpperCase();

    // Content-Type automático
    if (
      opts.body &&
      !opts.headers["Content-Type"] &&
      !opts.headers["content-type"]
    ) {
      opts.headers["Content-Type"] = "application/json";
    }

    let finalUrl = url;
    if (method === "GET" || method === "HEAD") {
      if (this.apiKey) {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set("api_key", this.apiKey);
        finalUrl = urlObj.toString();
      }
    } else if (this.apiKey) {
      opts.headers["X-API-KEY"] = this.apiKey;
    }

    let res = await fetch(finalUrl, opts);

    // Reintento con cabecera si recibimos 401
    if (res.status === 401 && this.apiKey) {
      const retryOpts = {
        ...opts,
        headers: { ...opts.headers, "X-API-KEY": this.apiKey },
      };
      res = await fetch(finalUrl, retryOpts);
    }
    return res;
  }
}
