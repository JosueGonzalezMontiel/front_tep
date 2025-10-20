// Contiene todas las operaciones CRUD para el recurso recursos_m
import ApiClient from "./apiClient.js";

export default class RecursosService {
  constructor(apiClient) {
    if (!(apiClient instanceof ApiClient)) {
      throw new Error("RecursosService requiere una instancia de ApiClient");
    }
    this.api = apiClient;
  }

  async list({ q = "", limit = 50, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("limit", limit);
    params.set("offset", offset);
    const url = `/recursos_m${
      params.toString() ? "?" + params.toString() : ""
    }`;
    const res = await this.api.request(url);
    if (!res.ok) throw new Error(`Error al listar recursos: ${res.status}`);
    return res.json();
  }

  async get(nu_inventario) {
    const res = await this.api.request(`/recursos_m/${nu_inventario}`);
    if (!res.ok)
      throw new Error(
        `No se pudo obtener el recurso ${nu_inventario}: ${res.status}`
      );
    return res.json();
  }

  async create(data) {
    const res = await this.api.request("/recursos_m", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(
        errData?.detail || `Error al crear recurso: ${res.status}`
      );
    }
    return res.json();
  }

  async update(nu_inventario, data) {
    const res = await this.api.request(`/recursos_m/${nu_inventario}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(
        errData?.detail || `Error al actualizar recurso: ${res.status}`
      );
    }
    return res.json();
  }

  async delete(nu_inventario) {
    const res = await this.api.request(`/recursos_m/${nu_inventario}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(`Error al eliminar recurso: ${res.status}`);
    }
  }
}
