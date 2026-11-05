const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelector("[data-nav-links]");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navLinks.classList.toggle("is-open", !isOpen);
  });
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll("[data-page-link]").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.setAttribute("aria-current", "page");
  }
});

function showFormStatus(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.className = `form-status is-visible is-${type}`;
}

function bindForm(formId, statusId, onSubmit) {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    onSubmit(form, status);
  });

  form.addEventListener("input", () => {
    if (status.classList.contains("is-visible")) {
      status.className = "form-status";
      status.textContent = "";
    }
  });
}

bindForm("registration-form", "registration-status", (form, status) => {
  const password = form.elements.password;
  const confirmation = form.elements["confirm-password"];
  if (password.value !== confirmation.value) {
    confirmation.setCustomValidity("Las contraseñas no coinciden.");
    confirmation.reportValidity();
    confirmation.setCustomValidity("");
    showFormStatus(status, "Revisa los campos marcados: las contraseñas no coinciden.", "error");
    return;
  }
  showFormStatus(status, `¡Registro completado, ${form.elements.fullName.value}! Tus datos quedaron guardados en esta demostración.`, "success");
  form.reset();
});

bindForm("contact-form", "contact-status", (form, status) => {
  if (form.elements.simulateError.checked) {
    showFormStatus(status, "No se pudo enviar el mensaje. Simulación de error del servidor; intenta de nuevo.", "error");
    return;
  }
  showFormStatus(status, `¡Gracias, ${form.elements.contactName.value}! Recibimos tu mensaje y te responderemos pronto.`, "success");
  form.reset();
  updateConditionalContactField();
  updateMessageCount();
});

const inquiryType = document.getElementById("inquiry-type");
const companyField = document.getElementById("company-field");

function updateConditionalContactField() {
  if (!inquiryType || !companyField) return;
  const showCompany = inquiryType.value === "business";
  companyField.hidden = !showCompany;
  const companyInput = document.getElementById("company-name");
  companyInput.required = showCompany;
}

inquiryType?.addEventListener("change", updateConditionalContactField);
updateConditionalContactField();

const messageInput = document.getElementById("contact-message");
const messageCount = document.getElementById("message-count");

function updateMessageCount() {
  if (messageInput && messageCount) {
    messageCount.textContent = `${messageInput.value.length} / ${messageInput.maxLength}`;
  }
}

messageInput?.addEventListener("input", updateMessageCount);
updateMessageCount();

const productGrid = document.getElementById("product-grid");
const productCategory = document.getElementById("product-category");
const productSearch = document.getElementById("product-search");
const loadMoreButton = document.getElementById("btn-load-more");
const productCount = document.getElementById("product-count");

const products = [
  { name: "Kit de bienvenida", category: "starter", icon: "🎒", price: "$24", description: "Todo lo esencial para empezar a explorar." },
  { name: "Plan esencial", category: "plans", icon: "🌿", price: "$12 / mes", description: "Una base simple para organizar tu próximo proyecto." },
  { name: "Guía de productividad", category: "resources", icon: "📘", price: "$18", description: "Ideas prácticas para trabajar con más enfoque." },
  { name: "Caja de herramientas", category: "starter", icon: "🧰", price: "$32", description: "Recursos seleccionados para tu día a día." },
  { name: "Plan equipo", category: "plans", icon: "👥", price: "$39 / mes", description: "Colabora y mantén a todo el equipo al día." },
  { name: "Plantillas creativas", category: "resources", icon: "✦", price: "$15", description: "Punto de partida para tus próximas ideas." },
  { name: "Pack de lanzamiento", category: "starter", icon: "🚀", price: "$45", description: "Un conjunto completo para comenzar con impulso." },
  { name: "Plan avanzado", category: "plans", icon: "⚡", price: "$59 / mes", description: "Más espacio y herramientas para crecer." },
  { name: "Manual de equipo", category: "resources", icon: "🗂️", price: "$21", description: "Buenas prácticas para colaborar mejor." }
];
let visibleProductCount = 6;

function renderProducts() {
  if (!productGrid) return;
  const category = productCategory?.value ?? "all";
  const query = productSearch?.value.trim().toLocaleLowerCase() ?? "";
  const matchingProducts = products.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const matchesQuery = `${product.name} ${product.description}`.toLocaleLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  productGrid.innerHTML = matchingProducts.slice(0, visibleProductCount).map((product, index) => `
    <article class="card product-card" data-testid="product-card" data-category="${product.category}">
      <div class="product-icon" aria-hidden="true">${product.icon}</div>
      <div class="product-meta"><span class="badge">${product.category === "plans" ? "Plan" : product.category === "resources" ? "Recurso" : "Kit"}</span><span class="product-price">${product.price}</span></div>
      <h3>${product.name}</h3>
      <p class="muted small">${product.description}</p>
      <button class="button button--secondary button--small" type="button" data-product-action="${product.name}" aria-label="Ver ${product.name}">Ver detalles</button>
    </article>
  `).join("");

  if (productCount) productCount.textContent = `Mostrando ${Math.min(matchingProducts.length, visibleProductCount)} de ${matchingProducts.length} productos`;
  if (loadMoreButton) loadMoreButton.hidden = matchingProducts.length <= visibleProductCount;

  productGrid.querySelectorAll("[data-product-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = products.find((product) => product.name === button.dataset.productAction);
      showToast(`${selected.name}: ${selected.description}`, "success");
    });
  });
}

productCategory?.addEventListener("change", () => { visibleProductCount = 6; renderProducts(); });
productSearch?.addEventListener("input", () => { visibleProductCount = 6; renderProducts(); });
loadMoreButton?.addEventListener("click", () => { visibleProductCount += 3; renderProducts(); });
renderProducts();

const dashboardTable = document.getElementById("orders-table");
const tableSearch = document.getElementById("table-search");
const statusFilter = document.getElementById("status-filter");
const modalBackdrop = document.getElementById("order-modal");
const modalForm = document.getElementById("order-form");

let orders = [
  { id: "ORD-1042", customer: "Sofía Martínez", item: "Kit de bienvenida", date: "2025-03-18", amount: 24, status: "Completado" },
  { id: "ORD-1041", customer: "Mateo García", item: "Plan equipo", date: "2025-03-17", amount: 39, status: "Pendiente" },
  { id: "ORD-1040", customer: "Valentina López", item: "Guía de productividad", date: "2025-03-16", amount: 18, status: "Completado" },
  { id: "ORD-1039", customer: "Lucas Rodríguez", item: "Caja de herramientas", date: "2025-03-15", amount: 32, status: "Cancelado" },
  { id: "ORD-1038", customer: "Emma Fernández", item: "Plan esencial", date: "2025-03-14", amount: 12, status: "Pendiente" }
];
let nextOrderNumber = 1043;

function renderOrders() {
  if (!dashboardTable) return;
  const query = tableSearch?.value.trim().toLocaleLowerCase() ?? "";
  const selectedStatus = statusFilter?.value ?? "all";
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = `${order.id} ${order.customer} ${order.item}`.toLocaleLowerCase().includes(query);
    return matchesSearch && (selectedStatus === "all" || order.status === selectedStatus);
  });

  dashboardTable.innerHTML = filteredOrders.length ? filteredOrders.map((order) => {
    const badgeClass = order.status === "Pendiente" ? "badge badge--pending" : order.status === "Cancelado" ? "badge badge--cancelled" : "badge";
    return `<tr data-order-id="${order.id}">
      <td><strong>${order.id}</strong></td><td>${order.customer}</td><td>${order.item}</td>
      <td><time datetime="${order.date}">${new Date(`${order.date}T12:00:00`).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</time></td>
      <td>$${order.amount.toFixed(2)}</td><td><span class="${badgeClass}">${order.status}</span></td>
      <td><div class="row-actions"><button class="button button--danger button--small" type="button" data-delete-order="${order.id}" aria-label="Eliminar pedido ${order.id}">Eliminar</button></div></td>
    </tr>`;
  }).join("") : `<tr><td class="empty-state" colspan="7" data-testid="empty-orders">No hay pedidos que coincidan con los filtros.</td></tr>`;

  const totalElement = document.getElementById("order-total");
  if (totalElement) totalElement.textContent = String(orders.length);
  dashboardTable.querySelectorAll("[data-delete-order]").forEach((button) => {
    button.addEventListener("click", () => {
      const orderId = button.dataset.deleteOrder;
      orders = orders.filter((order) => order.id !== orderId);
      renderOrders();
      showToast(`Pedido ${orderId} eliminado.`, "success");
    });
  });
}

tableSearch?.addEventListener("input", renderOrders);
statusFilter?.addEventListener("change", renderOrders);
renderOrders();

function openModal() {
  if (!modalBackdrop) return;
  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("order-customer")?.focus();
}

function closeModal() {
  if (!modalBackdrop) return;
  modalBackdrop.hidden = true;
  document.body.style.overflow = "";
  document.getElementById("btn-open-modal")?.focus();
}

document.getElementById("btn-open-modal")?.addEventListener("click", openModal);
document.getElementById("btn-close-modal")?.addEventListener("click", closeModal);
document.getElementById("btn-cancel-modal")?.addEventListener("click", closeModal);
modalBackdrop?.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalBackdrop && !modalBackdrop.hidden) closeModal();
});

modalForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!modalForm.reportValidity()) return;
  const formData = new FormData(modalForm);
  const item = String(formData.get("item"));
  const product = products.find((entry) => entry.name === item);
  orders.unshift({
    id: `ORD-${nextOrderNumber++}`,
    customer: String(formData.get("customer")),
    item,
    date: new Date().toISOString().slice(0, 10),
    amount: Number(product?.price.match(/\d+/)?.[0] ?? 0),
    status: "Pendiente"
  });
  modalForm.reset();
  closeModal();
  renderOrders();
  showToast("El pedido se agregó correctamente.", "success");
});

function showToast(message, type = "success") {
  const region = document.getElementById("toast-region");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = type === "error" ? "toast toast--error" : "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  region.append(toast);
  window.setTimeout(() => toast.remove(), 4000);
}
