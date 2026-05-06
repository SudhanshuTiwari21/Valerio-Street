import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Valerio Street",
    short_name: "Valerio",
    description: "Quiet luxury for the modern gentleman.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F1EA",
    theme_color: "#1A1A1A",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
