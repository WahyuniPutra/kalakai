export const invitationTemplates = [
  { id: "classic", name: "Klasik", detail: "Romantis dan elegan", color: "#b85c68", accent: "#dc9a9a", font: "serif" },
  { id: "garden", name: "Garden", detail: "Lembut bernuansa alami", color: "#54745b", accent: "#9bb48b", font: "serif" },
  { id: "modern", name: "Modern", detail: "Bersih dan kontemporer", color: "#55768f", accent: "#9cb7c9", font: "sans" },
  { id: "blank", name: "Mulai kosong", detail: "Kanvas untuk desain Anda sendiri", color: "#775f8f", accent: "#b4a1c4", font: "sans" },
] as const;

export type InvitationTemplate = (typeof invitationTemplates)[number];
export type InvitationTemplateId = InvitationTemplate["id"];

export function findInvitationTemplate(id: unknown) {
  return invitationTemplates.find((template) => template.id === id);
}
