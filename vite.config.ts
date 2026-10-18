import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./", // le build marche à n'importe quelle URL (GitHub Pages, Vercel, dossier local)
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
