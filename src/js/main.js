// src/js/main.js
import ApiClient from "./api/apiClient.js";
import PersonalService from "./api/personalService.js";
import RecursosService from "./api/recursosService.js";
import CaracteristicasService from "./api/caracteristicasService.js";
import MantenimientoService from "./api/mantenimientoService.js";
import PersonalPage from "./pages/personalPage.js";
import RecursosPage from "./pages/recursosPage.js";
import CaracteristicasPage from "./pages/caracteristicasPage.js";
import MantenimientoPage from "./pages/mantenimientoPage.js";
import Router from "./utils/router.js";

const API_BASE_URL = "http://localhost:8000";
const API_KEY = localStorage.getItem("API_KEY") || "dev_key_change_me";

const apiClient = new ApiClient(API_BASE_URL, API_KEY);
const personalService = new PersonalService(apiClient);
const recursosService = new RecursosService(apiClient);
const caracteristicasService = new CaracteristicasService(apiClient);
const mantenimientoService = new MantenimientoService(apiClient);

const personalPage = new PersonalPage(personalService);
const recursosPage = new RecursosPage(recursosService);
const caracteristicasPage = new CaracteristicasPage(caracteristicasService);
const mantenimientoPage = new MantenimientoPage(mantenimientoService);

const router = new Router({
  home: { el: "home-page", init: () => {} },
  personal: { el: "personal-page", init: () => personalPage.init() },
  recursos: { el: "recursos-page", init: () => recursosPage.init() },
  caracteristicas: {
    el: "caracteristicas-page",
    init: () => caracteristicasPage.init(),
  },
  mantenimiento: {
    el: "mantenimiento-page",
    init: () => mantenimientoPage.init(),
  },
  reportes: { el: "reportes-page", init: () => {} },
  configuracion: { el: "configuracion-page", init: () => {} },
});

window.navigateTo = (page) => router.navigate(page);
window.toggleSidebar = () => router.toggleSidebar();
window.closeSidebar = () => router.closeSidebar();

// Funciones de Personal
window.openAddPersonalModal = () => personalPage.openAddModal();
window.openSearchModal = () => personalPage.openSearchModal();
window.performSearch = () => personalPage.performSearch();
window.viewPersonal = (id) => personalPage.viewPersonal(id);
window.editPersonal = (id) => personalPage.editPersonal(id);
window.savePersonal = () => personalPage.savePersonal();
window.deletePersonal = (id, name) => personalPage.deletePersonal(id, name);
window.confirmDelete = () => personalPage.confirmDelete();

// Funciones de Recursos
window.openAddRecursoModal = () => recursosPage.openAddModal();
window.editRecurso = (id) => recursosPage.editRecurso(id);
window.saveRecurso = () => recursosPage.saveRecurso();
window.viewRecurso = (id) => recursosPage.viewRecurso(id);
window.deleteRecurso = (id) => recursosPage.deleteRecurso(id);
window.confirmDeleteRecurso = () => recursosPage.confirmDelete();
window.openRecursosSearchModal = () => recursosPage.openSearchModal();
window.performRecursosSearch = () => recursosPage.performSearch();

// Funciones de Características
window.openAddCaracteristicasModal = () => caracteristicasPage.openAddModal();
window.editCaracteristicas = (id) => caracteristicasPage.editRecord(id);
window.saveCaracteristicas = () => caracteristicasPage.saveRecord();
window.deleteCaracteristicas = (id) => caracteristicasPage.deleteRecord(id);
window.confirmDeleteCaracteristicas = () => caracteristicasPage.confirmDelete();

// Funciones de Mantenimiento
window.openAddMantenimientoModal = () => mantenimientoPage.openAddModal();
window.editMantenimiento = (id) => mantenimientoPage.editRecord(id);
window.saveMantenimiento = () => mantenimientoPage.saveRecord();
window.deleteMantenimiento = (id) => mantenimientoPage.deleteRecord(id);
window.confirmDeleteMantenimiento = () => mantenimientoPage.confirmDelete();

document.addEventListener("DOMContentLoaded", () => {
  console.log("Aplicación inicializada");
});
