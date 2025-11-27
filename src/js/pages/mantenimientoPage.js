// Lógica de la sección de mantenimiento
import MantenimientoService from "../api/mantenimientoService.js";

export default class MantenimientoPage {
  constructor(service) {
    if (!(service instanceof MantenimientoService)) {
      throw new Error(
        "MantenimientoPage requiere una instancia de MantenimientoService"
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
    this.tableBody = document.getElementById("mantenimiento-table-body");
    this.spinner = document.getElementById("mantenimiento-loading");
    this.errorMsg = document.getElementById("mantenimiento-error");
    this.form = document.getElementById("mantenimientoForm");
    this.formError = document.getElementById("mantenimientoFormError");
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
      const list = result.items || result.data || result;
      const records = Array.isArray(list) ? list : [];
      if (records.length === 0) {
        this.tableBody.innerHTML =
          '<tr><td colspan="8" class="text-center text-muted">No hay registros</td></tr>';
      } else {
        records.forEach((rec) => {
          // Formatear el nombre del responsable si viene como objeto
          const responsableText =
            typeof rec.responsable === "object" && rec.responsable !== null
              ? `${rec.responsable.nombre} ${rec.responsable.paterno}`.trim()
              : rec.responsable || "";

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${rec.id}</td>
            <td>${rec.nu_inventario}</td>
            <td>${rec.fecha || ""}</td>
            <td>${rec.trabajo || ""}</td>
            <td>${rec.fallas || ""}</td>
            <td>${rec.estatus || ""}</td>
            <td>${responsableText}</td>
            <td>
              <button class="btn btn-sm btn-info" data-id="${
                rec.id
              }" data-action="edit">Editar</button>
              <button class="btn btn-sm btn-danger" data-id="${
                rec.id
              }" data-action="delete">Eliminar</button>
            </td>`;
          this.tableBody.appendChild(row);
        });
        this.tableBody
          .querySelectorAll("button[data-action='edit']")
          .forEach((btn) =>
            btn.addEventListener("click", () =>
              this.editRecord(parseInt(btn.dataset.id))
            )
          );
        this.tableBody
          .querySelectorAll("button[data-action='delete']")
          .forEach((btn) =>
            btn.addEventListener("click", () =>
              this.deleteRecord(parseInt(btn.dataset.id))
            )
          );
      }
    } catch (err) {
      console.error("Error cargando mantenimientos:", err);
      this.errorMsg.textContent = `Error al cargar los datos: ${err.message}`;
      this.errorMsg.style.display = "";
    } finally {
      this.spinner.style.display = "none";
    }
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentRecord = null;
    document.getElementById("mantenimientoModalTitle").textContent =
      "Agregar Mantenimiento";
    if (this.form) this.form.reset();
    document.getElementById("man_id").disabled = true; // se genera automáticamente en el backend
    this.formError.style.display = "none";
    new bootstrap.Modal(document.getElementById("mantenimientoModal")).show();
  }

  async editRecord(id) {
    try {
      const rec = await this.service.get(id);
      this.currentRecord = rec;
      this.isEditMode = true;
      document.getElementById("mantenimientoModalTitle").textContent =
        "Editar Mantenimiento";
      document.getElementById("man_id").value = rec.id;
      document.getElementById("man_id").disabled = true;
      document.getElementById("man_nu_inventario").value =
        rec.nu_inventario || "";
      document.getElementById("man_fecha").value = rec.fecha || "";
      document.getElementById("man_trabajo").value = rec.trabajo || "";
      document.getElementById("man_fallas").value = rec.fallas || "";
      document.getElementById("man_estatus").value = rec.estatus || "";
      document.getElementById("man_observaciones").value =
        rec.observaciones || "";
      // El responsable puede venir como objeto desde el backend
      const responsableValue =
        typeof rec.responsable === "object" && rec.responsable !== null
          ? rec.responsable.expediente
          : rec.responsable;
      document.getElementById("man_responsable").value = responsableValue || "";
      this.formError.style.display = "none";
      new bootstrap.Modal(document.getElementById("mantenimientoModal")).show();
    } catch (err) {
      console.error("Error al cargar el registro:", err);
      alert("Error al cargar el registro: " + err.message);
    }
  }

  async saveRecord() {
    this.formError.style.display = "none";
    try {
      const responsableValue = document
        .getElementById("man_responsable")
        .value.trim();
      const payload = {
        nu_inventario:
          document.getElementById("man_nu_inventario").value.trim() || null,
        fecha: document.getElementById("man_fecha").value || null,
        trabajo: document.getElementById("man_trabajo").value.trim() || null,
        fallas: document.getElementById("man_fallas").value.trim() || null,
        estatus: document.getElementById("man_estatus").value.trim() || null,
        observaciones:
          document.getElementById("man_observaciones").value.trim() || null,
        responsable: responsableValue ? parseInt(responsableValue) : null,
      };
      // Validar campos obligatorios
      if (
        !payload.nu_inventario ||
        !payload.fecha ||
        !payload.trabajo ||
        !payload.fallas ||
        !payload.estatus ||
        !payload.responsable
      ) {
        this.formError.textContent =
          "Los campos marcados con * son obligatorios.";
        this.formError.style.display = "block";
        return;
      }
      const id = parseInt(document.getElementById("man_id").value);
      if (this.isEditMode) {
        await this.service.update(id, payload);
      } else {
        // Al crear, el backend asigna el ID; no se envía man_id
        await this.service.create({ ...payload });
      }
      const modalInst = bootstrap.Modal.getInstance(
        document.getElementById("mantenimientoModal")
      );
      if (modalInst) modalInst.hide();
      this.loadList();
    } catch (err) {
      console.error("Error al guardar:", err);
      this.formError.textContent = `Error: ${err.message}`;
      this.formError.style.display = "block";
    }
  }

  deleteRecord(id) {
    this.recordToDelete = id;
    document.getElementById("deleteMantenimientoName").textContent = id;
    new bootstrap.Modal(
      document.getElementById("deleteMantenimientoConfirmModal")
    ).show();
  }

  async confirmDelete() {
    if (!this.recordToDelete) return;
    try {
      await this.service.delete(this.recordToDelete);
      const modalInst = bootstrap.Modal.getInstance(
        document.getElementById("deleteMantenimientoConfirmModal")
      );
      if (modalInst) modalInst.hide();
      this.loadList();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar: " + err.message);
    }
  }
}
