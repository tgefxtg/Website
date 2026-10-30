import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
export default defineConfig({
  plugins: [
    react(),
    {
      name: "dotline-offline-shell",
      async closeBundle() {
        const files = (await readdir("dist/assets")).map(
          (file) => "/assets/" + file,
        );
        const version = createHash("sha256")
          .update(files.join("|"))
          .digest("hex")
          .slice(0, 12);
        const worker = await readFile("public/sw.js", "utf8");
        await writeFile(
          "dist/sw.js",
          worker
            .replace("__BUILD__", version)
            .replace("__ASSETS__", JSON.stringify(files)),
        );
      },
    },
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        headers: { connection: "close" },
      },
    },
  },
  build: { chunkSizeWarningLimit: 650 },
});
