// Gestiona el cambio de páginas y el comportamiento del sideba
export default class Router {
  constructor(routes) {
    this.routes = routes || {};
  }

  navigate(key) {
    // Ocultar todas las páginas
    Object.values(this.routes).forEach((cfg) => {
      const pageEl = document.getElementById(cfg.el);
      if (pageEl) pageEl.classList.remove("active");
    });
    const route = this.routes[key];
    if (route) {
      const pageEl = document.getElementById(route.el);
      if (pageEl) pageEl.classList.add("active");
      if (typeof route.init === "function") route.init();
    }
    this.closeSidebar();
  }

  toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.classList.toggle("active");
  }

  closeSidebar() {
    document
      .querySelectorAll(".sidebar")
      .forEach((el) => el.classList.remove("active"));
  }
}
