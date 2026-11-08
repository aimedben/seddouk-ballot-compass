import { createFileRoute } from "@tanstack/react-router";
import { ElectionClient } from "@/election/ElectionClient";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Seddouk Elections 2026 — Commune de Seddouk (Béjaïa)" },
      {
        name: "description",
        content: "Plateforme électorale et de vote citoyen pour les élections de la commune de Seddouk, wilaya de Béjaïa.",
      },
      { property: "og:title", content: "Seddouk Elections 2026" },
      {
        property: "og:description",
        content: "Plateforme électorale et de vote citoyen pour les élections de la commune de Seddouk, wilaya de Béjaïa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ElectionClient,
});
