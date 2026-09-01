import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JagaJajan",
    short_name: "JagaJajan",
    description: "Catat jajan harianmu dengan gaya — kelola dompet, pemasukan, dan pengeluaran",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F5FA",
    theme_color: "#7C3AED",
    orientation: "portrait",
    categories: ["finance", "utilities"],
    icons: [
      {
        src: "/icons/logo-baru.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/logo-baru.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/logo-baru.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
