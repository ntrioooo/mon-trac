import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MoneyTrack",
    short_name: "MoneyTrack",
    description: "Catat pengeluaran harian dengan cepat dan mudah",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F5FA",
    theme_color: "#10B981",
    orientation: "portrait",
    categories: ["finance", "utilities"],
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
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
