// frontend/src/services/api.js
const API = import.meta.env.VITE_API_URL || ""; // "" => proxy Vite /api en dev

export async function fetchDocuments() {
  const res = await fetch(`${API}/api/docs`);
  if (!res.ok) throw new Error("Erreur chargement documents");
  return res.json(); // { documents: [...] }
}

export function downloadDocument(id) {
  window.location.href = `${API}/api/docs/${id}/download`;
}

export function downloadAllZip() {
  window.location.href = `${API}/api/docs/zip`;
}

// Aperçu : ouvre soit l'URL calculée (/pdfs/...), soit la route preview par id
export function previewDocument(publicUrlOrId, fallbackId) {
  if (publicUrlOrId && publicUrlOrId.startsWith("/pdfs")) {
    // ex: "/pdfs/01_Declaration_de_Grossesse.pdf"
    window.open(publicUrlOrId, "_blank", "noopener,noreferrer");
  } else if (fallbackId) {
    window.open(
      `${API}/api/docs/${fallbackId}/preview`,
      "_blank",
      "noopener,noreferrer"
    );
  } else {
    alert("Ce document n’a pas d’URL valide");
  }
}
