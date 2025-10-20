// CRUD para características de los equipos
import ApiClient from "./apiClient.js";

export default class CaracteristicasService {
  constructor(apiClient) {
    if (!(apiClient instanceof ApiClient)) {
      throw new Error(
        "CaracteristicasService requiere una instancia de ApiClient"
      );
    }
    this.api = apiClient;
  }

  async list({ q = "", limit = 50, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("limit", limit);
    params.set("offset", offset);
    const url = `/caracteristicas${
      params.toString() ? "?" + params.toString() : ""
    }`;
    const res = await this.api.request(url);
    if (!res.ok)
      throw new Error(`Error al listar características: ${res.status}`);
    return res.json();
  }

  async get(nu_inventario) {
    const res = await this.api.request(`/caracteristicas/${nu_inventario}`);
    if (!res.ok)
      throw new Error(
        `No se pudo obtener características de ${nu_inventario}: ${res.status}`
      );
    return res.json();
  }

  async create(data) {
    const res = await this.api.request("/caracteristicas", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(
        errData?.detail || `Error al crear característica: ${res.status}`
      );
    }
    return res.json();
  }

  async update(nu_inventario, data) {
    const res = await this.api.request(`/caracteristicas/${nu_inventario}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(
        errData?.detail || `Error al actualizar característica: ${res.status}`
      );
    }
    return res.json();
  }

  async delete(nu_inventario) {
    const res = await this.api.request(`/caracteristicas/${nu_inventario}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(`Error al eliminar característica: ${res.status}`);
    }
  }
}
