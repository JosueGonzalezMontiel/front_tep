// Lógica para la página de características de equipos
import CaracteristicasService from "../api/caracteristicasService.js";

export default class CaracteristicasPage {
  constructor(service) {
    if (!(service instanceof CaracteristicasService)) {
      throw new Error(
        "CaracteristicasPage requiere una instancia de CaracteristicasService"
      );
    }
    this.service = service;
    this.initialized = false;
    this.currentRecord = null;
    this.recordToDelete = null;
    this.isEditMode = false;
  }

  init() {
    if (this.initialized) {
      this.loadList();
      return;
    }
    this.tableBody = document.getElementById("caracteristicas-table-body");
    this.spinner = document.getElementById("caracteristicas-loading");
    this.errorMsg = document.getElementById("caracteristicas-error");
    this.form = document.getElementById("caracteristicasForm");
    this.formError = document.getElementById("caracteristicasFormError");
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveRecord();
      });
    }
    this.initialized = true;
    this.loadList();
  }

  async loadList() {
    if (!this.tableBody || !this.spinner || !this.errorMsg) return;
    this.tableBody.innerHTML = "";
    this.spinner.style.display = "";
    this.errorMsg.style.display = "none";
    try {
      const result = await this.service.list({});
      const list = result.data || result;
      const records = Array.isArray(list) ? list : [];
      if (records.length === 0) {
        this.tableBody.innerHTML =
          '<tr><td colspan="9" class="text-center text-muted">No hay registros</td></tr>';
      } else {
        records.forEach((rec) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${rec.nu_inventario}</td>
            <td>${rec.nombre || ""}</td>
            <td>${rec.ip || ""}</td>
            <td>${rec.procesador || ""}</td>
            <td>${rec.memoria || ""}</td>
            <td>${rec.disco_duro || ""}</td>
            <td>${rec.paqueterias || ""}</td>
            <td>${rec.inv_anterio || ""}</td>
            <td>
              <button class="btn btn-sm btn-info" data-id="${
                rec.nu_inventario
              }" data-action="edit">Editar</button>
              <button class="btn btn-sm btn-danger" data-id="${
                rec.nu_inventario
              }" data-action="delete">Eliminar</button>
            </td>`;
          this.tableBody.appendChild(row);
        });
        this.tableBody
          .querySelectorAll("button[data-action='edit']")
          .forEach((btn) =>
            btn.addEventListener("click", () => this.editRecord(btn.dataset.id))
          );
        this.tableBody
          .querySelectorAll("button[data-action='delete']")
          .forEach((btn) =>
            btn.addEventListener("click", () =>
              this.deleteRecord(btn.dataset.id)
            )
          );
      }
    } catch (err) {
      console.error("Error cargando características:", err);
      this.errorMsg.textContent = `Error al cargar los datos: ${err.message}`;
      this.errorMsg.style.display = "";
    } finally {
      this.spinner.style.display = "none";
    }
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentRecord = null;
    document.getElementById("caracteristicasModalTitle").textContent =
      "Agregar Características";
    if (this.form) this.form.reset();
    document.getElementById("car_nu_inventario").disabled = false;
    this.formError.style.display = "none";
    new bootstrap.Modal(document.getElementById("caracteristicasModal")).show();
  }

  async editRecord(nu_inventario) {
    try {
      const rec = await this.service.get(nu_inventario);
      this.currentRecord = rec;
      this.isEditMode = true;
      document.getElementById("caracteristicasModalTitle").textContent =
        "Editar Características";
      document.getElementById("car_nu_inventario").value = rec.nu_inventario;
      document.getElementById("car_nu_inventario").disabled = true;
      document.getElementById("car_nombre").value = rec.nombre || "";
      document.getElementById("car_ip").value = rec.ip || "";
      document.getElementById("car_procesador").value = rec.procesador || "";
      document.getElementById("car_memoria").value = rec.memoria || "";
      document.getElementById("car_disco_duro").value = rec.disco_duro || "";
      document.getElementById("car_paqueterias").value = rec.paqueterias || "";
      document.getElementById("car_inv_anterio").value = rec.inv_anterio || "";
      this.formError.style.display = "none";
      new bootstrap.Modal(
        document.getElementById("caracteristicasModal")
      ).show();
    } catch (err) {
      console.error("Error al cargar el registro:", err);
      alert("Error al cargar el registro: " + err.message);
    }
  }

  async saveRecord() {
    this.formError.style.display = "none";
    try {
      const payload = {
        nombre: document.getElementById("car_nombre").value.trim() || null,
        ip: document.getElementById("car_ip").value.trim() || null,
        procesador:
          document.getElementById("car_procesador").value.trim() || null,
        memoria: document.getElementById("car_memoria").value.trim() || null,
        disco_duro:
          document.getElementById("car_disco_duro").value.trim() || null,
        paqueterias:
          document.getElementById("car_paqueterias").value.trim() || null,
        inv_anterio:
          document.getElementById("car_inv_anterio").value.trim() || null,
      };
      const nu_inventario = document
        .getElementById("car_nu_inventario")
        .value.trim();
      if (!nu_inventario) {
        this.formError.textContent = "El campo 'nu_inventario' es obligatorio.";
        this.formError.style.display = "block";
        return;
      }
      if (this.isEditMode) {
        await this.service.update(nu_inventario, payload);
      } else {
        await this.service.create({ nu_inventario, ...payload });
      }
      const modalInst = bootstrap.Modal.getInstance(
        document.getElementById("caracteristicasModal")
      );
      if (modalInst) modalInst.hide();
      this.loadList();
    } catch (err) {
      console.error("Error al guardar:", err);
      this.formError.textContent = `Error: ${err.message}`;
      this.formError.style.display = "block";
    }
  }

  deleteRecord(nu_inventario) {
    this.recordToDelete = nu_inventario;
    document.getElementById("deleteCaracteristicasName").textContent =
      nu_inventario;
    new bootstrap.Modal(
      document.getElementById("deleteCaracteristicasConfirmModal")
    ).show();
  }

  async confirmDelete() {
    if (!this.recordToDelete) return;
    try {
      await this.service.delete(this.recordToDelete);
      const modalInst = bootstrap.Modal.getInstance(
        document.getElementById("deleteCaracteristicasConfirmModal")
      );
      if (modalInst) modalInst.hide();
      this.loadList();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar: " + err.message);
    }
  }
}
