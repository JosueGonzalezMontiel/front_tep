// Componente responsable de renderizar cada tarjeta de personal.
export default class PersonalCard {
  constructor(person, onView, onEdit, onDelete) {
    this.person = person;
    this.onView = onView;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
  }

  static resolveImageSrc(ruta) {
    if (!ruta) return null;
    let path = ruta.replace(/\\/g, "/").trim();
    if (/^https?:\/\//i.test(path)) return path;
    const lower = path.toLowerCase();
    let imgPath = null;
    const idx = lower.indexOf("/img/");
    if (idx !== -1) {
      imgPath = path.substring(idx + 1);
    } else {
      if (path.startsWith("img/")) imgPath = path;
      else if (/^personal\//i.test(path)) imgPath = `img/${path}`;
      else {
        const basename = path.split("/").pop();
        imgPath = `public/img/personal/${basename}`;
      }
    }
    const base =
      window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "");
    const final = imgPath.startsWith("/")
      ? `${window.location.origin}${imgPath}`
      : `${base}/${imgPath}`;
    return final.replace(/([^:]\/)\/+/g, "$1");
  }

  render() {
    const person = this.person;
    const card = document.createElement("div");
    card.className = "personal-card";
    const nombreCompleto = `${person.paterno} ${person.materno || ""} ${
      person.nombre
    }`.trim();
    const imgSrc = PersonalCard.resolveImageSrc(person.ruta);

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
          <div><strong>Estado:</strong> ${person.estado_civil || "N/A"}</div>
          <div><strong>Nacimiento:</strong> ${
            person.f_nacimiento || "N/A"
          }</div>
        </div>
        <div class="personal-actions">
          <button class="btn-action btn-view"><i class="bi bi-eye"></i> Ver</button>
          <button class="btn-action btn-edit"><i class="bi bi-pencil"></i> Editar</button>
          <button class="btn-action btn-delete"><i class="bi bi-trash"></i> Eliminar</button>
        </div>
      </div>
    `;

    const actions = card.querySelector(".personal-actions");
    const [viewBtn, editBtn, deleteBtn] = actions.querySelectorAll("button");
    if (viewBtn)
      viewBtn.addEventListener("click", () => {
        if (typeof this.onView === "function")
          this.onView(this.person.expediente);
      });
    if (editBtn)
      editBtn.addEventListener("click", () => {
        if (typeof this.onEdit === "function")
          this.onEdit(this.person.expediente);
      });
    if (deleteBtn)
      deleteBtn.addEventListener("click", () => {
        if (typeof this.onDelete === "function")
          this.onDelete(this.person.expediente, nombreCompleto);
      });
    return card;
  }
}
