import { DatabaseSync, backup } from "node:sqlite"
import { mkdirSync, existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
const here = dirname(fileURLToPath(import.meta.url))
const file = resolve(
  here,
  process.env.ERP_DB ||
    (process.env.NODE_ENV === "production"
      ? "data/production.sqlite"
      : "data/development.sqlite"),
)
if (!existsSync(file)) throw new Error("Database does not exist: " + file)
const folder = resolve(here, "data/backups")
mkdirSync(folder, { recursive: true })
const destination = resolve(
  folder,
  "erp-" + new Date().toISOString().replace(/[:.]/g, "-") + ".sqlite",
)
const db = new DatabaseSync(file, { readOnly: true })
try {
  await backup(db, destination)
  console.log("Consistent database snapshot: " + destination)
} finally {
  db.close()
}
