// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true, // Opcional pero recomendado para Capacitor
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
