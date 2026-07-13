import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://sanchika.complyeaze.com",
  vite: {
    css: {
      transformer: "postcss",
    },
    build: {
      cssMinify: "esbuild",
    },
  },
  build: {
    format: "directory",
  },
});
