import { build } from "vite"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
const here = dirname(fileURLToPath(import.meta.url))
await build({
  root: resolve(here, ".."),
  build: { outDir: resolve(here, "build"), emptyOutDir: true },
})
