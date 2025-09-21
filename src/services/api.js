const API = import.meta.env.VITE_API_URL || "";

export async function fetchDocuments() {
  const res = await fetch(`${API}/api/docs`);
  if (!res.ok) throw new Error("Erreur chargement documents");
  return res.json();
}

export function downloadDocument(id) {
  window.location.href = `${API}/api/docs/${id}/download`;
}

export function downloadAllZip() {
  window.location.href = `${API}/api/docs/zip`;
}

export function previewDocument(file) {
  // ouvre le PDF dans un nouvel onglet
  const url = `${API}/pdfs/${file}`;
  window.open(url, "_blank", "noopener");
}
