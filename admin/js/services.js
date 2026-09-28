const SERVICES_API = "http://localhost:5000/api/services";

document.addEventListener("DOMContentLoaded", loadServices);

async function loadServices() {
  const tbody = document.getElementById("servicesTableBody");
  if (!tbody) return;

  try {
    const response = await fetch(`${SERVICES_API}/all`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to load services"
      );
    }

    renderServices(result.data || []);
  } catch (error) {
    console.error("Services error:", error);

    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">
          Unable to load services
        </td>
      </tr>
    `;
  }
}

function renderServices(services) {
  const tbody =
    document.getElementById("servicesTableBody");

  if (!tbody) return;

  if (!services.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">
          No services found
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML = services.map(service => `
    <tr>
      <td>${escapeHtml(service.serviceId)}</td>

      <td>${escapeHtml(service.name)}</td>

      <td>${escapeHtml(service.category)}</td>

      <td>
        ${escapeHtml(service.description)}
      </td>

      <td>
        ${escapeHtml(
          service.processingTime || "-"
        )}
      </td>

      <td>
        ₹${Number(
          service.applicationFee || 0
        ).toFixed(2)}
      </td>

      <td>
        <span class="status ${
          service.status === "Active"
            ? "active"
            : "inactive"
        }">
          ${escapeHtml(service.status)}
        </span>

        <button
          type="button"
          onclick="toggleServiceStatus('${service._id}')"
        >
          ${
            service.status === "Active"
              ? "Deactivate"
              : "Activate"
          }
        </button>

        <button
          type="button"
          onclick="deleteService('${service._id}')"
        >
          Delete
        </button>
      </td>
    </tr>
  `).join("");
}

// =========================================================
// ADD SERVICE
// =========================================================

async function addService(event) {
  event.preventDefault();

  const form = event.target;

  const data = {
    serviceId: form.serviceId.value.trim(),
    name: form.name.value.trim(),
    description: form.description.value.trim(),
    category: form.category.value.trim(),
    eligibility: form.eligibility.value.trim(),
    requiredDocuments: form.requiredDocuments.value
      .split(",")
      .map(item => item.trim())
      .filter(Boolean),

    processingTime:
      form.processingTime.value.trim(),

    applicationFee:
      Number(form.applicationFee.value || 0),

    status: form.status
      ? form.status.value
      : "Active"
  };

  try {
    const response = await fetch(
      SERVICES_API,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to create service"
      );
    }

    alert("Service added successfully.");

    form.reset();

    await loadServices();

  } catch (error) {
    console.error(
      "Add service error:",
      error
    );

    alert(error.message);
  }
}

// =========================================================
// STATUS
// =========================================================

async function toggleServiceStatus(id) {
  try {
    const response = await fetch(
      `${SERVICES_API}/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to update status"
      );
    }

    await loadServices();

  } catch (error) {
    console.error(
      "Service status error:",
      error
    );

    alert(error.message);
  }
}

// =========================================================
// DELETE
// =========================================================

async function deleteService(id) {
  if (!confirm("Delete this service?")) {
    return;
  }

  try {
    const response = await fetch(
      `${SERVICES_API}/${id}`,
      {
        method: "DELETE"
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to delete service"
      );
    }

    await loadServices();

  } catch (error) {
    console.error(
      "Delete service error:",
      error
    );

    alert(error.message);
  }
}

// =========================================================
// ESCAPE
// =========================================================

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.loadServices = loadServices;
window.addService = addService;
window.toggleServiceStatus =
  toggleServiceStatus;
window.deleteService = deleteService;