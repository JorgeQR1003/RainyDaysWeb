import type { MetadataRoute } from "next"

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rainy Days - Aplicación del Clima",
    short_name: "Rainy Days",
    description: "Tu compañero personalizado del clima con iconos adorables",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f59e0b",
    icons: [
      {
        src: "/sun-logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  }
}
