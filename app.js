// Configuración de la API
const API_BASE_URL = "http://localhost:8000"; // Cambiar según tu configuración
// Agrega / configura tu API key aquí o en localStorage (ver nota abajo)
const API_KEY = localStorage.getItem("API_KEY") || "dev_key_change_me";

// Helper: realiza fetch incluyendo la API Key (intento por header; si responde 401 reintenta usando query param)
async function apiFetch(path, options = {}) {
  const url =
    path.startsWith("http") || path.startsWith("https")
      ? path
      : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  options = options || {};
  options.headers = options.headers || {};

  // Incluir credenciales (cookies/sesión)
  options.credentials = options.credentials || "include";

  const method = (options.method || "GET").toUpperCase();

  // Añadir Content-Type solo cuando hay body
  if (
    options.body &&
    !options.headers["Content-Type"] &&
    !options.headers["content-type"]
  ) {
    options.headers["Content-Type"] = "application/json";
  }

  // Para GET/HEAD: evitar enviar cabeceras custom (X-API-KEY) que provocan preflight.
  // En su lugar, pasar api_key en query string.
  let finalUrl = url;
  if (method === "GET" || method === "HEAD") {
    if (API_KEY) {
      const urlObj = new URL(url);
      // preservar parámetros existentes
      urlObj.searchParams.set("api_key", API_KEY);
      finalUrl = urlObj.toString();
    }
  } else {
    // Para otros métodos enviar X-API-KEY en cabecera
    options.headers["X-API-KEY"] = API_KEY;
  }

  let res = await fetch(finalUrl, options);

  // Si dio 401 e intentamos con header (fallback): reintentar usando header/query según corresponda
  if (res.status === 401 && API_KEY) {
    const urlObj = new URL(finalUrl);
    // si ya no tenemos header, intentar con header
    const retryOptions = { ...options, headers: { ...options.headers } };
    if (!retryOptions.headers["X-API-KEY"]) {
      retryOptions.headers["X-API-KEY"] = API_KEY;
    }
    res = await fetch(urlObj.toString(), retryOptions);
  }

  return res;
}

// Estado global
let currentPersonal = null;
let personalToDelete = null;
let isEditMode = false;

// Importación de Bootstrap
const bootstrap = window.bootstrap;

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  console.log("App iniciada");
});

// Navegación SPA
function navigateTo(page) {
  // Ocultar todas las páginas
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));

  // Mostrar la página seleccionada
  const pageId = `${page}-page`;
  const pageElement = document.getElementById(pageId);
  if (pageElement) {
    pageElement.classList.add("active");

    // Cerrar sidebar en móvil
    closeSidebar();

    // Cargar datos si es necesario
    if (page === "personal") {
      loadPersonal();
    }
  }
}

// Toggle Sidebar
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.classList.toggle("active");
  }
}

function closeSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.classList.remove("active");
  }
}

// Cargar lista de personal
async function loadPersonal() {
  const grid = document.getElementById("personal-grid");
  const spinner = document.getElementById("loading-spinner");
  const errorMsg = document.getElementById("error-message");

  grid.innerHTML = "";
  spinner.style.display = "block";
  errorMsg.style.display = "none";

  try {
    // Usar los parámetros que tu backend sugiere (skip, limit)
    const response = await apiFetch("/personal?skip=0&limit=50");

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const personal = await response.json();

    if (personal.length === 0) {
      grid.innerHTML =
        '<div class="col-12"><p class="text-center text-muted">No hay registros de personal</p></div>';
    } else {
      personal.forEach((person) => {
        grid.appendChild(createPersonalCard(person));
      });
    }
  } catch (error) {
    console.error("Error cargando personal:", error);
    errorMsg.textContent = `Error al cargar los datos: ${error.message}`;
    errorMsg.style.display = "block";
  } finally {
    spinner.style.display = "none";
  }
}

// Helper: normaliza una ruta desde la BD a una URL que el navegador pueda cargar
function resolveImageSrc(ruta) {
  if (!ruta) return null;
  // normalizar separadores y trim
  ruta = ruta.replace(/\\/g, "/").trim();

  // Si ya es una URL absoluta
  if (/^https?:\/\//i.test(ruta)) return ruta;

  // Buscar segmento "img/" dentro de la ruta (ej: C:/.../img/personal/1002.png)
  const lower = ruta.toLowerCase();
  let imgPath = null;
  const idx = lower.indexOf("/img/");
  if (idx !== -1) {
    imgPath = ruta.substring(idx + 1); // "img/..."`
  } else {
    // Si la ruta ya empieza por "img/" o "personal/..." o es solo filename
    if (ruta.startsWith("img/")) imgPath = ruta;
    else if (/^personal\//i.test(ruta)) imgPath = `img/${ruta}`;
    else {
      // tomar basename y asumir carpeta img/personal
      const basename = ruta.split("/").pop();
      imgPath = `img/personal/${basename}`;
    }
  }

  // Construir URL absoluta relativa al lugar donde se sirve index.html
  // base = origen + path hasta la carpeta (e.g. http://localhost/gov-platform)
  const base = location.origin + location.pathname.replace(/\/[^/]*$/, "");
  // si imgPath comienza con '/', usar origen directo
  const final = imgPath.startsWith("/")
    ? `${location.origin}${imgPath}`
    : `${base}/${imgPath}`;
  // Normalizar "//" accidental
  return final.replace(/([^:]\/)\/+/g, "$1");
}

// Crear tarjeta de personal
function createPersonalCard(person) {
  const card = document.createElement("div");
  card.className = "personal-card";

  const nombreCompleto = `${person.paterno} ${person.materno || ""} ${
    person.nombre
  }`.trim();

  const imgSrc = resolveImageSrc(person.ruta);

  card.innerHTML = `
        <div class="personal-image">
            ${
              imgSrc
                ? `<img src="${imgSrc}" alt="${nombreCompleto}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                : ""
            }
            <div class="personal-image-placeholder" style="${
              imgSrc ? "display:none;" : ""
            }">
                <i class="bi bi-person-circle"></i>
            </div>
        </div>
        <div class="personal-info">
            <div class="personal-header">
                <div class="personal-expediente">EXP. ${person.expediente}</div>
                <h3 class="personal-name">${nombreCompleto}</h3>
            </div>
            <div class="personal-details">
                <div><strong>Cargo:</strong> ${person.cargo || "N/A"}</div>
                <div><strong>Adscripción:</strong> ${
                  person.adscripcion || "N/A"
                }</div>
                <div><strong>Estado:</strong> ${
                  person.estado_civil || "N/A"
                }</div>
                <div><strong>Nacimiento:</strong> ${
                  person.f_nacimiento || "N/A"
                }</div>
            </div>
            <div class="personal-actions">
                <button class="btn-action btn-view" onclick="viewPersonal(${
                  person.expediente
                })">
                    <i class="bi bi-eye"></i> Ver
                </button>
                <button class="btn-action btn-edit" onclick="editPersonal(${
                  person.expediente
                })">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn-action btn-delete" onclick="deletePersonal(${
                  person.expediente
                }, '${nombreCompleto}')">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;

  return card;
}

// Abrir modal para agregar personal
function openAddPersonalModal() {
  isEditMode = false;
  currentPersonal = null;
  document.getElementById("modalTitle").textContent = "Agregar Personal";
  document.getElementById("personalForm").reset();
  document.getElementById("expediente").disabled = false;
  document.getElementById("formError").style.display = "none";

  const modal = new bootstrap.Modal(document.getElementById("personalModal"));
  modal.show();
}

// NUEVO: abrir modal de búsqueda
function openSearchModal() {
  document.getElementById("searchQuery").value = "";
  document.getElementById("searchResults").innerHTML = "";
  const err = document.getElementById("searchError");
  err.style.display = "none";
  const modal = new bootstrap.Modal(document.getElementById("searchModal"));
  modal.show();
}

// NUEVO: ejecutar búsqueda (por expediente o por nombre)
async function performSearch() {
  const q = document.getElementById("searchQuery").value.trim();
  const resultsEl = document.getElementById("searchResults");
  const errorEl = document.getElementById("searchError");
  resultsEl.innerHTML = "";
  errorEl.style.display = "none";

  if (!q) {
    errorEl.textContent = "Ingresa un nombre o número de expediente.";
    errorEl.style.display = "block";
    return;
  }

  try {
    // Si es sólo dígitos, buscar por expediente directo
    if (/^\d+$/.test(q)) {
      const res = await apiFetch(`/personal/${q}`);
      if (!res.ok) {
        throw new Error(
          `No se encontró el expediente ${q} (status ${res.status})`
        );
      }
      const person = await res.json();
      resultsEl.appendChild(createPersonalCard(person));
      return;
    }

    // Si es texto, obtener lista (limit aumentado) y filtrar cliente-side
    const res = await apiFetch("/personal?skip=0&limit=500");
    if (!res.ok) {
      throw new Error(`Error al solicitar datos: ${res.status}`);
    }
    const list = await res.json();
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

    // Mostrar resultados (tarjetas); los botones de la tarjeta permiten ver/editar/eliminar
    filtered.forEach((person) => {
      resultsEl.appendChild(createPersonalCard(person));
    });
  } catch (err) {
    console.error("Error buscando personal:", err);
    errorEl.textContent = err.message || "Error en la búsqueda";
    errorEl.style.display = "block";
  }
}

// Ver detalles de personal
async function viewPersonal(expediente) {
  try {
    // const response = await fetch(`${API_BASE_URL}/personal/${expediente}`);
    const response = await apiFetch(`/personal/${expediente}`);

    if (!response.ok) {
      throw new Error("No se pudo cargar el registro");
    }

    const person = await response.json();

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

    const imgElement = document.getElementById("viewImage");
    const src = resolveImageSrc(person.ruta);
    if (src) {
      imgElement.src = src;
      imgElement.style.display = "block";
    } else {
      imgElement.style.display = "none";
    }

    const modal = new bootstrap.Modal(
      document.getElementById("viewPersonalModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cargar los detalles: " + error.message);
  }
}

// Editar personal
async function editPersonal(expediente) {
  try {
    // const response = await fetch(`${API_BASE_URL}/personal/${expediente}`);
    const response = await apiFetch(`/personal/${expediente}`);

    if (!response.ok) {
      throw new Error("No se pudo cargar el registro");
    }

    const person = await response.json();
    currentPersonal = person;
    isEditMode = true;

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
    document.getElementById("formError").style.display = "none";

    const modal = new bootstrap.Modal(document.getElementById("personalModal"));
    modal.show();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cargar el registro: " + error.message);
  }
}

// Guardar personal (crear o actualizar)
async function savePersonal() {
  const formError = document.getElementById("formError");
  formError.style.display = "none";

  try {
    const expediente = Number.parseInt(
      document.getElementById("expediente").value
    );
    const paterno = document.getElementById("paterno").value.trim();
    const materno = document.getElementById("materno").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const f_nacimiento = document.getElementById("f_nacimiento").value;
    const estado_civil = document.getElementById("estado_civil").value;
    const adscripcion = document.getElementById("adscripcion").value.trim();
    const cargo = document.getElementById("cargo").value.trim();
    const ruta = document.getElementById("ruta").value.trim();

    // Validaciones
    if (!expediente || !paterno || !nombre) {
      formError.textContent = "Por favor completa los campos requeridos (*)";
      formError.style.display = "block";
      return;
    }

    const payload = {
      expediente,
      paterno,
      materno: materno || null,
      nombre,
      f_nacimiento: f_nacimiento || null,
      estado_civil: estado_civil || null,
      adscripcion: adscripcion || null,
      cargo: cargo || null,
      ruta: ruta || null,
    };

    let response;
    let method;
    let url;

    if (isEditMode) {
      method = "PUT";
      url = `/personal/${expediente}`;
      // Para PUT, no incluir expediente en el payload
      delete payload.expediente;
    } else {
      method = "POST";
      url = `/personal`;
    }

    response = await apiFetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        // X-API-KEY ya lo añade apiFetch
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Error: ${response.status}`);
    }

    // Cerrar modal y recargar
    bootstrap.Modal.getInstance(
      document.getElementById("personalModal")
    ).hide();
    loadPersonal();
  } catch (error) {
    console.error("Error:", error);
    formError.textContent = `Error: ${error.message}`;
    formError.style.display = "block";
  }
}

// Preparar eliminación
function deletePersonal(expediente, nombre) {
  personalToDelete = expediente;
  document.getElementById("deletePersonName").textContent = nombre;

  const modal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal")
  );
  modal.show();
}

// Confirmar eliminación
async function confirmDelete() {
  if (!personalToDelete) return;

  try {
    // const response = await fetch(`${API_BASE_URL}/personal/${personalToDelete}`, { method: "DELETE" });
    const response = await apiFetch(`/personal/${personalToDelete}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    bootstrap.Modal.getInstance(
      document.getElementById("deleteConfirmModal")
    ).hide();
    loadPersonal();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al eliminar: " + error.message);
  }
}
