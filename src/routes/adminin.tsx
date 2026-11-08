import { createFileRoute } from "@tanstack/react-router";
import { ElectionClient } from "@/election/ElectionClient";

export const Route = createFileRoute("/adminin")({
  head: () => ({
    meta: [
      { title: "Administration — Seddouk Elections 2026" },
      { name: "description", content: "Console d'administration de la plateforme électorale de Seddouk." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Administration — Seddouk Elections 2026" },
      { property: "og:description", content: "Console d'administration de la plateforme électorale de Seddouk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ElectionClient,
});
