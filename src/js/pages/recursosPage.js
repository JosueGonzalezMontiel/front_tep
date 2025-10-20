// Manejador de la sección de recursos materiales
import RecursosService from "../api/recursosService.js";
import PersonalCard from "../components/personalCard.js";

export default class RecursosPage {
  constructor(service) {
    if (!(service instanceof RecursosService)) {
      throw new Error("RecursosPage requiere una instancia de RecursosService");
    }
    this.service = service;
    this.initialized = false;
    this.currentRecurso = null;
    this.resourceToDelete = null;
    this.isEditMode = false;
  }

  init() {
    // Si ya está inicializada solo recargar la lista
    if (this.initialized) {
      this.loadList();
      return;
    }
    this.tableBody = document.getElementById("recursos-table-body");
    this.spinner = document.getElementById("recursos-loading");
    this.errorMsg = document.getElementById("recursos-error");
    this.form = document.getElementById("recursosForm");
    this.formError = document.getElementById("recursosFormError");

    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveRecurso();
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
      // El backend devuelve { data: [...], total: <n> }
      const result = await this.service.list({});
      const list = result.items || result.data || result;
      const records = Array.isArray(list) ? list : [];
      if (records.length === 0) {
        this.tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-muted">No hay registros de recursos</td>
          </tr>`;
      } else {
        records.forEach((rec) => {
          const row = document.createElement("tr");
          const imgSrc = rec.ruta ? PersonalCard.resolveImageSrc(rec.ruta) : "";
          row.innerHTML = `
            <td>${rec.nu_inventario}</td>
            <td>${rec.descripcion || ""}</td>
            <td>${rec.marca}</td>
            <td>${rec.modelo}</td>
            <td>${rec.expediente_resguardo || ""}</td>
            <td>${
              imgSrc
                ? `<img src="${imgSrc}" class="img-thumbnail" style="max-width:80px;">`
                : ""
            }</td>
            <td>
              <button class="btn btn-sm btn-info" data-id="${
                rec.nu_inventario
              }" data-action="edit">Editar</button>
              <button class="btn btn-sm btn-danger" data-id="${
                rec.nu_inventario
              }" data-action="delete">Eliminar</button>
            </td>
          `;
          this.tableBody.appendChild(row);
        });
        this.tableBody
          .querySelectorAll("button[data-action='edit']")
          .forEach((btn) =>
            btn.addEventListener("click", () =>
              this.editRecurso(btn.dataset.id)
            )
          );
        this.tableBody
          .querySelectorAll("button[data-action='delete']")
          .forEach((btn) =>
            btn.addEventListener("click", () =>
              this.deleteRecurso(btn.dataset.id)
            )
          );
      }
    } catch (err) {
      console.error("Error cargando recursos:", err);
      this.errorMsg.textContent = `Error al cargar los datos: ${err.message}`;
      this.errorMsg.style.display = "";
    } finally {
      this.spinner.style.display = "none";
    }
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentRecurso = null;
    document.getElementById("recursosModalTitle").textContent =
      "Agregar Recurso";
    if (this.form) this.form.reset();
    document.getElementById("nu_inventario").disabled = false;
    this.formError.style.display = "none";
    const modalEl = document.getElementById("recursosModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  async editRecurso(nu_inventario) {
    try {
      const rec = await this.service.get(nu_inventario);
      this.currentRecurso = rec;
      this.isEditMode = true;
      document.getElementById("recursosModalTitle").textContent =
        "Editar Recurso";
      document.getElementById("nu_inventario").value = rec.nu_inventario;
      document.getElementById("nu_inventario").disabled = true;
      document.getElementById("nu_NSAR").value = rec.nu_NSAR || "";
      document.getElementById("descripcion").value = rec.descripcion || "";
      document.getElementById("marca").value = rec.marca || "";
      document.getElementById("modelo").value = rec.modelo || "";
      document.getElementById("serie").value = rec.serie || "";
      document.getElementById("observaciones").value = rec.observaciones || "";
      document.getElementById("material").value = rec.material || "";
      document.getElementById("color").value = rec.color || "";
      document.getElementById("estado_fisico").value = rec.estado_fisico || "";
      document.getElementById("ubicacion").value = rec.ubicacion || "";
      document.getElementById("expediente_resguardo").value =
        rec.expediente_resguardo || "";
      document.getElementById("fecha_asig").value = rec.fecha_asig || "";
      document.getElementById("ruta_rec").value = rec.ruta || "";
      this.formError.style.display = "none";
      const modal = new bootstrap.Modal(
        document.getElementById("recursosModal")
      );
      modal.show();
    } catch (err) {
      console.error("Error al cargar recurso:", err);
      alert("Error al cargar el registro: " + err.message);
    }
  }

  async saveRecurso() {
    this.formError.style.display = "none";
    try {
      const payload = {
        nu_NSAR: document.getElementById("nu_NSAR").value.trim(),
        descripcion:
          document.getElementById("descripcion").value.trim() || null,
        marca: document.getElementById("marca").value.trim(),
        modelo: document.getElementById("modelo").value.trim(),
        serie: document.getElementById("serie").value.trim(),
        observaciones:
          document.getElementById("observaciones").value.trim() || null,
        material: document.getElementById("material").value.trim() || null,
        color: document.getElementById("color").value.trim() || null,
        estado_fisico:
          document.getElementById("estado_fisico").value.trim() || null,
        ubicacion: document.getElementById("ubicacion").value.trim() || null,
        expediente_resguardo:
          document.getElementById("expediente_resguardo").value || null,
        fecha_asig: document.getElementById("fecha_asig").value || null,
        ruta: document.getElementById("ruta_rec").value.trim() || null,
      };
      const nu_inventario = document
        .getElementById("nu_inventario")
        .value.trim();
      if (
        !nu_inventario ||
        !payload.nu_NSAR ||
        !payload.marca ||
        !payload.modelo
      ) {
        this.formError.textContent = "Completa los campos obligatorios (*)";
        this.formError.style.display = "block";
        return;
      }
      if (this.isEditMode) {
        await this.service.update(nu_inventario, payload);
      } else {
        await this.service.create({ nu_inventario, ...payload });
      }
      const modalInst = bootstrap.Modal.getInstance(
        document.getElementById("recursosModal")
      );
      if (modalInst) modalInst.hide();
      this.loadList();
    } catch (err) {
      console.error("Error al guardar:", err);
      this.formError.textContent = `Error: ${err.message}`;
      this.formError.style.display = "block";
    }
  }

  deleteRecurso(nu_inventario) {
    this.resourceToDelete = nu_inventario;
    document.getElementById("deleteRecursosName").textContent = nu_inventario;
    const modal = new bootstrap.Modal(
      document.getElementById("deleteRecursosConfirmModal")
    );
    modal.show();
  }

  async confirmDelete() {
    if (!this.resourceToDelete) return;
    try {
      await this.service.delete(this.resourceToDelete);
      const modalInst = bootstrap.Modal.getInstance(
        document.getElementById("deleteRecursosConfirmModal")
      );
      if (modalInst) modalInst.hide();
      this.loadList();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar: " + err.message);
    }
  }

  /** Opcional: búsqueda por nombre o expediente (usa el parámetro q del backend).
      Carga tarjetas horizontales con la información del personal y sus recursos. */
  openSearchModal() {
    const qEl = document.getElementById("searchRecursosQuery");
    const resultsEl = document.getElementById("searchRecursosResults");
    const errorEl = document.getElementById("searchRecursosError");
    if (qEl) qEl.value = "";
    if (resultsEl) resultsEl.innerHTML = "";
    if (errorEl) errorEl.style.display = "none";
    const modalEl = document.getElementById("searchRecursosModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  async performSearch() {
    const qEl = document.getElementById("searchRecursosQuery");
    const resultsEl = document.getElementById("searchRecursosResults");
    const errorEl = document.getElementById("searchRecursosError");
    if (!qEl || !resultsEl || !errorEl) return;
    const q = qEl.value.trim();
    resultsEl.innerHTML = "";
    errorEl.style.display = "none";
    if (!q) {
      errorEl.textContent = "Ingresa nombre o expediente para buscar";
      errorEl.style.display = "block";
      return;
    }
    try {
      const result = await this.service.list({ q, limit: 100, offset: 0 });
      const list = result.items || result.data || result;
      if (!list || list.length === 0) {
        errorEl.textContent = "No se encontraron resultados.";
        errorEl.style.display = "block";
        return;
      }
      // agrupar por expediente_resguardo
      const grouped = {};
      list.forEach((r) => {
        const exp = r.expediente_resguardo || "Sin expediente";
        if (!grouped[exp]) grouped[exp] = [];
        grouped[exp].push(r);
      });
      for (const exp in grouped) {
        const recs = grouped[exp];
        const person = recs[0].expediente_resguardo; // La clave devuelta incluye info del personal
        // Tarjeta horizontal
        const card = document.createElement("div");
        card.className = "card mb-3";
        card.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">Expediente: ${person.expediente} - ${
          person.paterno
        } ${person.materno || ""} ${person.nombre}</h5>
            <p class="card-text"><strong>Adscripción:</strong> ${
              person.adscripcion || "N/A"
            }</p>
            <p class="card-text"><strong>Cargo:</strong> ${
              person.cargo || "N/A"
            }</p>
            <h6>Recursos asignados:</h6>
            <ul class="list-group list-group-flush">
              ${recs
                .map(
                  (r) =>
                    `<li class="list-group-item">${r.nu_inventario} - ${
                      r.descripcion || ""
                    } (${r.marca} ${r.modelo})</li>`
                )
                .join("")}
            </ul>
          </div>`;
        resultsEl.appendChild(card);
      }
    } catch (err) {
      console.error("Error en la búsqueda:", err);
      errorEl.textContent = err.message || "Error en la búsqueda";
      errorEl.style.display = "block";
    }
  }
}
