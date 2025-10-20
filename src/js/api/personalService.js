// Contiene todas las operaciones CRUD para el recurso personal:
import ApiClient from "./apiClient.js";

export default class PersonalService {
  constructor(apiClient) {
    if (!(apiClient instanceof ApiClient)) {
      throw new Error("PersonalService requiere una instancia de ApiClient");
    }
    this.api = apiClient;
  }

  async list(skip = 0, limit = 50) {
    const res = await this.api.request(`/personal?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Error al listar personal: ${res.status}`);
    return res.json();
  }

  async get(expediente) {
    const res = await this.api.request(`/personal/${expediente}`);
    if (!res.ok)
      throw new Error(
        `No se pudo obtener el expediente ${expediente} (${res.status})`
      );
    return res.json();
  }

  async create(data) {
    const res = await this.api.request("/personal", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(
        errData?.detail || `Error al crear personal: ${res.status}`
      );
    }
    return res.json();
  }

  async update(expediente, data) {
    const res = await this.api.request(`/personal/${expediente}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(
        errData?.detail || `Error al actualizar personal: ${res.status}`
      );
    }
    return res.json();
  }

  async delete(expediente) {
    const res = await this.api.request(`/personal/${expediente}`, {
      method: "DELETE",
    });
    if (!res.ok)
      throw new Error(`Error al eliminar el expediente: ${res.status}`);
  }
}
