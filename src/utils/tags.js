// src/utils/tags.js

/**
 * Normalise les libellés de tags afin d'unifier leur affichage.
 */
export function normalizeTag(tag) {
  if (!tag) return "";
  return String(tag)
    .trim()
    .replace(/^0[\s–-]?3\s?ans$/i, "1–3 ans")
    .replace(/^3\s?ans$/i, "1–3 ans")
    .replace(/^1\s?à\s?3\s?ans$/i, "1–3 ans");
}

/**
 * Retourne les couleurs cohérentes selon le tag.
 */
export function tagColor(tag) {
  switch (normalizeTag(tag)) {
    case "Grossesse":
      return { background: "#9AC8EB", color: "#1f2a44" }; // bleu pastel
    case "Naissance":
      return { background: "#F7F6CF", color: "#1f2a44" }; // jaune clair
    case "1–3 ans":
      return { background: "#F4CFDF", color: "#1f2a44" }; // rose doux
    default:
      return { background: "#B6D8F2", color: "#1f2a44" }; // neutre
  }
}
