const SCHEMES_API = "http://localhost:5000/api/schemes";

document.addEventListener("DOMContentLoaded", loadSchemes);

async function loadSchemes() {
  const container = document.getElementById("schemesTableBody");
  if (!container) return;

  try {
    const response = await fetch(`${SCHEMES_API}/all`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to load schemes");
    }

    renderSchemes(result.data || []);
  } catch (error) {
    console.error("Schemes error:", error);

    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">
          Unable to load schemes
        </td>
      </tr>
    `;
  }
}

function renderSchemes(schemes) {
  const container = document.getElementById("schemesTableBody");
  if (!container) return;

  if (!schemes.length) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">
          No schemes found
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = schemes.map((scheme) => `
    <tr>
      <td>${escapeHtml(scheme.schemeId)}</td>
      <td>${escapeHtml(scheme.title)}</td>
      <td>${escapeHtml(scheme.category)}</td>
      <td>${escapeHtml(scheme.description)}</td>
      <td>${escapeHtml(scheme.benefits || "-")}</td>

      <td>
        <span class="status ${scheme.status === "Active" ? "active" : "inactive"}">
          ${escapeHtml(scheme.status)}
        </span>
      </td>

      <td>
        <button
          type="button"
          onclick="toggleSchemeStatus('${scheme._id}')"
        >
          ${scheme.status === "Active" ? "Deactivate" : "Activate"}
        </button>

        <button
          type="button"
          onclick="deleteScheme('${scheme._id}')"
        >
          Delete
        </button>
      </td>
    </tr>
  `).join("");
}

// =========================================================
// ADD SCHEME
// =========================================================

async function addScheme(event) {
  event.preventDefault();

  const form = event.target;

  const data = {
    schemeId: form.schemeId.value.trim(),
    title: form.title.value.trim(),
    description: form.description.value.trim(),
    category: form.category.value.trim(),
    eligibility: form.eligibility.value.trim(),
    benefits: form.benefits.value.trim(),
    applicationUrl: form.applicationUrl.value.trim(),
    status: form.status
      ? form.status.value
      : "Active"
  };

  try {
    const response = await fetch(SCHEMES_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to create scheme"
      );
    }

    alert("Scheme added successfully.");

    form.reset();

    await loadSchemes();

  } catch (error) {
    console.error("Add scheme error:", error);
    alert(error.message);
  }
}

// =========================================================
// STATUS
// =========================================================

async function toggleSchemeStatus(id) {
  try {
    const response = await fetch(
      `${SCHEMES_API}/${id}/status`,
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

    await loadSchemes();

  } catch (error) {
    console.error(
      "Scheme status error:",
      error
    );

    alert(error.message);
  }
}

// =========================================================
// DELETE
// =========================================================

async function deleteScheme(id) {
  if (!confirm("Delete this scheme?")) {
    return;
  }

  try {
    const response = await fetch(
      `${SCHEMES_API}/${id}`,
      {
        method: "DELETE"
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to delete scheme"
      );
    }

    await loadSchemes();

  } catch (error) {
    console.error(
      "Delete scheme error:",
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

window.loadSchemes = loadSchemes;
window.addScheme = addScheme;
window.toggleSchemeStatus = toggleSchemeStatus;
window.deleteScheme = deleteScheme;