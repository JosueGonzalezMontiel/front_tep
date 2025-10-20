// front_tep_new/src/js/main.js
import ApiClient from "./api/apiClient.js";
import PersonalService from "./api/personalService.js";
import RecursosService from "./api/recursosService.js";
import PersonalPage from "./pages/personalPage.js";
import RecursosPage from "./pages/recursosPage.js";
import Router from "./utils/router.js";

const API_BASE_URL = "http://localhost:8000";
const API_KEY = localStorage.getItem("API_KEY") || "dev_key_change_me";

const apiClient = new ApiClient(API_BASE_URL, API_KEY);
const personalService = new PersonalService(apiClient);
const recursosService = new RecursosService(apiClient);

const personalPage = new PersonalPage(personalService);
const recursosPage = new RecursosPage(recursosService);

const router = new Router({
  home: { el: "home-page", init: () => {} },
  personal: { el: "personal-page", init: () => personalPage.init() },
  departamentos: { el: "departamentos-page", init: () => {} },
  reportes: { el: "reportes-page", init: () => {} },
  configuracion: { el: "configuracion-page", init: () => {} },
  // Agrega aquí la ruta 'recursos' cuando exista un contenedor con id="recursos-page"
});

window.navigateTo = (page) => router.navigate(page);
window.toggleSidebar = () => router.toggleSidebar();
window.closeSidebar = () => router.closeSidebar();

window.openAddPersonalModal = () => personalPage.openAddModal();
window.openSearchModal = () => personalPage.openSearchModal();
window.performSearch = () => personalPage.performSearch();
window.viewPersonal = (id) => personalPage.viewPersonal(id);
window.editPersonal = (id) => personalPage.editPersonal(id);
window.savePersonal = () => personalPage.savePersonal();
window.deletePersonal = (id, name) => personalPage.deletePersonal(id, name);
window.confirmDelete = () => personalPage.confirmDelete();

document.addEventListener("DOMContentLoaded", () => {
  console.log("Aplicación inicializada");
});
