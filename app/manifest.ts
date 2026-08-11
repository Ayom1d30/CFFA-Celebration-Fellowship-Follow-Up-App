import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CFFA - Celebration Fellowship Follow-up App",
    short_name: "CFFA",
    description:
      "Weekly follow-up buddies, missions, and engagement for Celebration Fellowship members.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F7FC",
    theme_color: "#7C3AED",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
