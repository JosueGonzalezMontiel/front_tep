// CRUD para registros de mantenimiento
import ApiClient from "./apiClient.js";

export default class MantenimientoService {
  constructor(apiClient) {
    if (!(apiClient instanceof ApiClient)) {
      throw new Error(
        "MantenimientoService requiere una instancia de ApiClient"
      );
    }
    this.api = apiClient;
  }

  async list({ q = "", limit = 50, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("limit", limit);
    params.set("offset", offset);
    const url = `/mantenimiento${
      params.toString() ? "?" + params.toString() : ""
    }`;
    const res = await this.api.request(url);
    if (!res.ok)
      throw new Error(`Error al listar mantenimientos: ${res.status}`);
    return res.json();
  }

  async get(id) {
    const res = await this.api.request(`/mantenimiento/${id}`);
    if (!res.ok)
      throw new Error(`No se pudo obtener mantenimiento ${id}: ${res.status}`);
    return res.json();
  }

  async create(data) {
    const res = await this.api.request("/mantenimiento", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(
        errData?.detail || `Error al crear mantenimiento: ${res.status}`
      );
    }
    return res.json();
  }

  async update(id, data) {
    const res = await this.api.request(`/mantenimiento/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(
        errData?.detail || `Error al actualizar mantenimiento: ${res.status}`
      );
    }
    return res.json();
  }

  async delete(id) {
    const res = await this.api.request(`/mantenimiento/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(`Error al eliminar mantenimiento: ${res.status}`);
    }
  }
}
