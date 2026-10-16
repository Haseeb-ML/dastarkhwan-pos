import { mkdirSync } from "node:fs"
mkdirSync(new URL("../data/test/", import.meta.url), { recursive: true })
process.env.ERP_PORT = "5199"
process.env.ERP_DB = "data/test/browser-" + Date.now() + ".sqlite"
process.env.ERP_SEED = "1"
await import("../server.mjs")
