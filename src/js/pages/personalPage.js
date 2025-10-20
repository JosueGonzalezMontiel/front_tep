// Encapsula toda la lógica de la sección de personal que antes estaba en app.js
import PersonalService from "../api/personalService.js";
import PersonalCard from "../components/personalCard.js";

export default class PersonalPage {
  constructor(service) {
    if (!(service instanceof PersonalService)) {
      throw new Error("PersonalPage requiere una instancia de PersonalService");
    }
    this.service = service;
    this.initialized = false;
    this.currentPersonal = null;
    this.personalToDelete = null;
    this.isEditMode = false;
  }

  init() {
    // Si ya está inicializada, solo recargar la lista
    if (this.initialized) {
      this.loadList();
      return;
    }
    this.grid = document.getElementById("personal-grid");
    this.spinner = document.getElementById("loading-spinner");
    this.errorMsg = document.getElementById("error-message");
    this.form = document.getElementById("personalForm");
    this.formError = document.getElementById("formError");
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.savePersonal();
      });
    }
    this.initialized = true;
    this.loadList();
  }

  async loadList() {
    if (!this.grid || !this.spinner || !this.errorMsg) return;
    this.grid.innerHTML = "";
    this.spinner.style.display = "block";
    this.errorMsg.style.display = "none";
    try {
      const list = await this.service.list(0, 50);
      if (list.length === 0) {
        this.grid.innerHTML =
          '<div class="col-12"><p class="text-center text-muted">No hay registros de personal</p></div>';
      } else {
        list.forEach((person) => {
          const card = new PersonalCard(
            person,
            (id) => this.viewPersonal(id),
            (id) => this.editPersonal(id),
            (id, name) => this.deletePersonal(id, name)
          ).render();
          this.grid.appendChild(card);
        });
      }
    } catch (err) {
      console.error("Error cargando personal:", err);
      this.errorMsg.textContent = `Error al cargar los datos: ${err.message}`;
      this.errorMsg.style.display = "block";
    } finally {
      this.spinner.style.display = "none";
    }
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentPersonal = null;
    document.getElementById("modalTitle").textContent = "Agregar Personal";
    if (this.form) this.form.reset();
    document.getElementById("expediente").disabled = false;
    this.formError.style.display = "none";
    const modalEl = document.getElementById("personalModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  openSearchModal() {
    const qEl = document.getElementById("searchQuery");
    const resultsEl = document.getElementById("searchResults");
    const errEl = document.getElementById("searchError");
    if (qEl) qEl.value = "";
    if (resultsEl) resultsEl.innerHTML = "";
    if (errEl) errEl.style.display = "none";
    const modalEl = document.getElementById("searchModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  async performSearch() {
    const qEl = document.getElementById("searchQuery");
    const resultsEl = document.getElementById("searchResults");
    const errorEl = document.getElementById("searchError");
    if (!qEl || !resultsEl || !errorEl) return;
    const q = qEl.value.trim();
    resultsEl.innerHTML = "";
    errorEl.style.display = "none";
    if (!q) {
      errorEl.textContent = "Ingresa un nombre o número de expediente.";
      errorEl.style.display = "block";
      return;
    }
    try {
      if (/^\d+$/.test(q)) {
        const person = await this.service.get(q);
        const card = new PersonalCard(
          person,
          (id) => this.viewPersonal(id),
          (id) => this.editPersonal(id),
          (id, name) => this.deletePersonal(id, name)
        ).render();
        resultsEl.appendChild(card);
        return;
      }
      const list = await this.service.list(0, 500);
      const qLower = q.toLowerCase();
      const filtered = list.filter((p) => {
        const full = `${p.expediente} ${p.nombre || ""} ${p.paterno || ""} ${
          p.materno || ""
        }`.toLowerCase();
        return full.includes(qLower);
      });
      if (filtered.length === 0) {
        errorEl.textContent = "No se encontraron resultados.";
        errorEl.style.display = "block";
        return;
      }
      filtered.forEach((person) => {
        const card = new PersonalCard(
          person,
          (id) => this.viewPersonal(id),
          (id) => this.editPersonal(id),
          (id, name) => this.deletePersonal(id, name)
        ).render();
        resultsEl.appendChild(card);
      });
    } catch (err) {
      console.error("Error buscando personal:", err);
      errorEl.textContent = err.message || "Error en la búsqueda";
      errorEl.style.display = "block";
    }
  }

  async viewPersonal(expediente) {
    try {
      const person = await this.service.get(expediente);
      document.getElementById("viewExpediente").textContent = person.expediente;
      document.getElementById("viewNombreCompleto").textContent = `${
        person.paterno
      } ${person.materno || ""} ${person.nombre}`.trim();
      document.getElementById("viewFNacimiento").textContent =
        person.f_nacimiento || "N/A";
      document.getElementById("viewEstadoCivil").textContent =
        person.estado_civil || "N/A";
      document.getElementById("viewAdscripcion").textContent =
        person.adscripcion || "N/A";
      document.getElementById("viewCargo").textContent = person.cargo || "N/A";
      const imgEl = document.getElementById("viewImage");
      const src = PersonalCard.resolveImageSrc(person.ruta);
      if (src) {
        imgEl.src = src;
        imgEl.style.display = "block";
      } else {
        imgEl.style.display = "none";
      }
      const modal = new bootstrap.Modal(
        document.getElementById("viewPersonalModal")
      );
      modal.show();
    } catch (err) {
      console.error("Error al cargar detalles:", err);
      alert("Error al cargar los detalles: " + err.message);
    }
  }

  async editPersonal(expediente) {
    try {
      const person = await this.service.get(expediente);
      this.currentPersonal = person;
      this.isEditMode = true;
      document.getElementById("modalTitle").textContent = "Editar Personal";
      document.getElementById("expediente").value = person.expediente;
      document.getElementById("expediente").disabled = true;
      document.getElementById("paterno").value = person.paterno;
      document.getElementById("materno").value = person.materno || "";
      document.getElementById("nombre").value = person.nombre;
      document.getElementById("f_nacimiento").value = person.f_nacimiento || "";
      document.getElementById("estado_civil").value = person.estado_civil || "";
      document.getElementById("adscripcion").value = person.adscripcion || "";
      document.getElementById("cargo").value = person.cargo || "";
      document.getElementById("ruta").value = person.ruta || "";
      this.formError.style.display = "none";
      const modal = new bootstrap.Modal(
        document.getElementById("personalModal")
      );
      modal.show();
    } catch (err) {
      console.error("Error al cargar registro:", err);
      alert("Error al cargar el registro: " + err.message);
    }
  }

  async savePersonal() {
    if (!this.formError) return;
    this.formError.style.display = "none";
    try {
      const expediente = parseInt(
        document.getElementById("expediente").value,
        10
      );
      const paterno = document.getElementById("paterno").value.trim();
      const materno = document.getElementById("materno").value.trim();
      const nombre = document.getElementById("nombre").value.trim();
      const f_nacimiento = document.getElementById("f_nacimiento").value;
      const estado_civil = document.getElementById("estado_civil").value;
      const adscripcion = document.getElementById("adscripcion").value.trim();
      const cargo = document.getElementById("cargo").value.trim();
      const ruta = document.getElementById("ruta").value.trim();

      if (!expediente || !paterno || !nombre) {
        this.formError.textContent =
          "Por favor completa los campos requeridos (*)";
        this.formError.style.display = "block";
        return;
      }

      const payload = {
        paterno,
        materno: materno || null,
        nombre,
        f_nacimiento: f_nacimiento || null,
        estado_civil: estado_civil || null,
        adscripcion: adscripcion || null,
        cargo: cargo || null,
        ruta: ruta || null,
      };

      if (this.isEditMode) {
        await this.service.update(expediente, payload);
      } else {
        await this.service.create({ expediente, ...payload });
      }
      const modalInst = bootstrap.Modal.getInstance(
        document.getElementById("personalModal")
      );
      if (modalInst) modalInst.hide();
      this.loadList();
    } catch (err) {
      console.error("Error al guardar:", err);
      this.formError.textContent = `Error: ${err.message}`;
      this.formError.style.display = "block";
    }
  }

  deletePersonal(expediente, nombreCompleto) {
    this.personalToDelete = expediente;
    document.getElementById("deletePersonName").textContent = nombreCompleto;
    const modal = new bootstrap.Modal(
      document.getElementById("deleteConfirmModal")
    );
    modal.show();
  }

  async confirmDelete() {
    if (!this.personalToDelete) return;
    try {
      await this.service.delete(this.personalToDelete);
      const modalInst = bootstrap.Modal.getInstance(
        document.getElementById("deleteConfirmModal")
      );
      if (modalInst) modalInst.hide();
      this.loadList();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar: " + err.message);
    }
  }
}
