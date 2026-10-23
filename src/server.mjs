import {auditXlsx} from "./audit_excel.mjs"
import {auditCSV} from "./audit_text.mjs"
import {dataManagement} from "./data_management.mjs"
import invoiceView from "./invoice_print.mjs"
import http from "node:http"

import { randomBytes, createHash } from "node:crypto"

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  statSync,
  createReadStream,
} from "node:fs"

import { resolve, dirname, extname, basename } from "node:path"

import { fileURLToPath } from "node:url"

import { spawn } from "node:child_process"

import {
  openERP,
  hashPassword,
  verifyPassword,
  fail,
  now,
  text,
} from "./erp.mjs"

const here = dirname(fileURLToPath(import.meta.url))

const production = process.env.NODE_ENV === "production"

const app = openERP(
  resolve(
    here,
    process.env.ERP_DB ||
      (production ? "data/production.sqlite" : "data/development.sqlite"),
  ),
  { seed: process.env.ERP_SEED !== "0" },
)

const port = Number(process.env.PORT || process.env.ERP_PORT || 8443),
  altPort = port === 8443 ? 5173 : 8443,
  host = process.env.ERP_HOST || "0.0.0.0"

const cookieName = "erp_session"

const attempts = new Map()

const json = (res, status, data) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  })
  res.end(JSON.stringify(data))
}

const session = (req) => {
  const cookies = Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((x) => x.trim().split("=")),
  )

  const authHeader = req.headers.authorization
  const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
  const token = bearerToken || cookies[cookieName]
  if (!token) return null

  const hash = createHash("sha256").update(token).digest("hex")

  return (
    app.one(
      "SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>? AND u.active=1",
      hash,
      Date.now(),
    ) || null
  )
}

async function body(req, max = 3 * 1024 * 1024) {
  const chunks = []
  let bytes = 0
  for await (const chunk of req) {
    bytes += chunk.length
    if (bytes > max) fail("Request too large", 413)
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")
  } catch {
    fail("Invalid JSON")
  }
}

const maintenance=dataManagement(app,{root:resolve(here,"data"),production});

const server = http.createServer(async (req, res) => {
  try {
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")

    const origin = req.headers.origin
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin)
      res.setHeader("Access-Control-Allow-Credentials", "true")
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key, Authorization, X-Requested-With")
    }

    if (req.method === "OPTIONS") {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url, "http://localhost"),
      path = url.pathname

    if (path.startsWith("/api/")) {
      res.setHeader("Cache-Control", "no-store")

      if (req.method === "POST" && req.headers.origin) {
        let originHost
        try {
          originHost = new URL(req.headers.origin).hostname
        } catch {
          fail("Invalid origin header", 400)
        }
        const reqHost = (req.headers["x-forwarded-host"] || req.headers.host || "").split(":")[0]
        const isAllowedDomain = /^(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|\S+\.loca\.lt|\S+\.ngrok-free\.app|\S+\.trycloudflare\.com|\S+\.web\.app|\S+\.firebaseapp\.com|\S+\.onrender\.com)$/i.test(originHost)
        if (originHost !== reqHost && !isAllowedDomain) {
          fail("Cross-origin write rejected", 403)
        }
      }

      if (path === "/api/health")
        return json(res, 200, {
          ok: true,
          database: "SQLite",
          mode: production ? "production" : "development",
          setupRequired: !app.one("SELECT id FROM users LIMIT 1"),
        })

      if (path === "/api/auth/login" && req.method === "POST") {
        const b = await body(req),
          key = req.socket.remoteAddress,
          rate = attempts.get(key) || { n: 0, at: Date.now() }
        if (Date.now() - rate.at > 600000) {
          rate.n = 0
          rate.at = Date.now()
        }
        if (rate.n >= 10)
          fail("Too many login attempts. Try again in 10 minutes.", 429)

        const u = app.one(
          "SELECT * FROM users WHERE username=? AND active=1",
          String(b.username || ""),
        )
        if (!u || !verifyPassword(b.password, u.password)) {
          rate.n++
          attempts.set(key, rate)
          fail("Incorrect username or password", 401)
        }

        attempts.delete(key)
        const token = randomBytes(32).toString("hex"),
          hash = createHash("sha256").update(token).digest("hex")
        app.run(
          "INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)",
          hash,
          u.id,
          Date.now() + 12 * 3600000,
        )

        const isSecure = process.env.ERP_SECURE === "1" || req.headers["x-forwarded-proto"] === "https"
        res.setHeader(
          "Set-Cookie",
          cookieName +
            "=" +
            token +
            "; HttpOnly; SameSite=Strict; Path=/" +
            (isSecure ? "; Secure" : "") +
            "; Max-Age=43200",
        )
        return json(res, 200, { id: u.id, name: u.name, role: u.role, token })
      }

      if (path === "/api/auth/setup" && req.method === "POST") {
        if (app.one("SELECT id FROM users LIMIT 1"))
          fail("Initial setup already completed", 409)

        const b = await body(req)
        if (
          !process.env.ERP_SETUP_TOKEN ||
          b.setupToken !== process.env.ERP_SETUP_TOKEN
        )
          fail("Setup token required", 403)
        const id = Number(
          app.run(
            "INSERT INTO users(username,name,role,password) VALUES(?,?,'Owner',?)",
            text(b.username, 50),
            text(b.name),
            hashPassword(b.password),
          ).lastInsertRowid,
        )
        return json(res, 201, { id })
      }

      const u = session(req)
      if (!u) fail("Please sign in", 401)

      if (path === "/api/auth/logout" && req.method === "POST") {
        const token = String(req.headers.cookie || "").match(
          /erp_session=([^;]+)/,
        )?.[1]
        if (token)
          app.run(
            "DELETE FROM sessions WHERE token=?",
            createHash("sha256").update(token).digest("hex"),
          )
        res.setHeader(
          "Set-Cookie",
          cookieName + "=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
        )
        return json(res, 200, { ok: true })
      }

      if(path==='/api/audit/export') {
        if(req.method!=='GET')fail('Method not allowed',405);
        if(u.role!=='Owner')fail('Access restricted',403);
        const rows=app.all("SELECT a.*,u.name actor_name FROM audit a LEFT JOIN users u ON u.id=a.actor ORDER BY a.id DESC");
        const xlsx=await auditXlsx(rows);
        res.writeHead(200,{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="hotel-work-history.xlsx"'});
        return res.end(xlsx);
      }

      if(path.startsWith('/api/maintenance/')) {
        if(req.method!=='POST')fail('Method not allowed',405);
        return json(res,200,maintenance.handle(path.slice(5),await body(req),u));
      }

      if (path.startsWith("/api/operations/") && req.method === "GET") {
        const op = app.one(
          "SELECT route,result FROM idempotency WHERE actor=? AND key=?",
          u.id,
          path.split("/").pop(),
        )

        if (!op) return json(res, 200, { found: false })

        if (u.role === "Kitchen" && op.route !== "tickets")
          fail("Access restricted", 403)

        const ownerRoutes = [
          "refunds",
          "orders/cancel",
          "menu/save",
          "menu/archive",
          "ingredients/save",
          "stock/move",
          "suppliers/save",
          "purchases",
          "suppliers/pay",
          "expenses",
          "cash/open",
          "cash/close",
          "settings",
          "tables/save",
          "staff",
        ]

        if (ownerRoutes.includes(op.route)) app.owner(u)

        return json(res, 200, { found: true, result: JSON.parse(op.result) })
      }

      if (path === "/api/uploads" && req.method === "POST") {
        app.owner(u)
        const b = await body(req),
          match = String(b.data || "").match(
            /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/,
          )
        if (!match) fail("Upload a PNG, JPEG or WebP image")
        const data = Buffer.from(match[2], "base64")
        if (data.length > 2 * 1024 * 1024) fail("Resize image to less than 2MB")
        if (
          (match[1] === "png" &&
            data.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") ||
          (match[1] === "jpeg" &&
            data.subarray(0, 2).toString("hex") !== "ffd8") ||
          (match[1] === "webp" && data.subarray(8, 12).toString() !== "WEBP")
        )
          fail("Invalid image contents")

        const name = randomBytes(16).toString("hex") + "." + match[1]
        mkdirSync(resolve(here, "data/uploads"), { recursive: true })
        writeFileSync(resolve(here, "data/uploads", name), data)
        return json(res, 201, { url: "/uploads/" + name })
      }

      if (path.startsWith("/api/invoices/")) {
        app.cashier(u)
        const parts = path.split("/"),
          o = app.order(Number(parts[3]))
        const revision = Number(url.searchParams.get("revision") || o.revision)

        if (revision !== o.revision) {
          const old = app.one(
            "SELECT snapshot FROM invoice_revisions WHERE invoice_id=? AND revision=?",
            o.invoiceId,
            revision,
          )
          if (!old) fail("Revision not found", 404)
          Object.assign(o, JSON.parse(old.snapshot), { revision })
          o.collectible =
            o.state === "cancelled" ? 0 : Math.max(0, o.total - o.refunded)
          o.balance = Math.max(0, o.collectible - o.net)
          o.paymentStatus =
            o.state === "cancelled"
              ? "Cancelled"
              : o.balance === 0
                ? "Paid"
                : o.net > 0
                  ? "Partial"
                  : "Unpaid"
        }

        const size = url.searchParams.get("size") === "80mm" ? "80mm" : "A4"

        if (parts[4] === "data") return json(res, 200, o)

        if (parts[4] === "pdf") {
          const child = spawn(
              process.env.ERP_PYTHON || "python",
              [resolve(here, "invoice_pdf.py"), size],
              { windowsHide: true },
            ),
            chunks = [],
            errors = []
          child.stdout.on("data", (c) => chunks.push(c))
          child.stderr.on("data", (c) => errors.push(c))
          const sendFallbackPdf = () => {
            if (res.writableEnded) return
            const lines = [
              `Dastarkhwan Invoice: ${o.number}`,
              `Date: ${new Date(o.created_at || Date.now()).toLocaleString()}`,
              `Service: ${o.service || "Dine-in"}  |  Table: ${o.table_name || "N/A"}`,
              `Customer: ${o.customer_name || "Walk-in"}`,
              `Total: Rs. ${Number(o.total || 0).toLocaleString()}`,
              `Paid: Rs. ${Number(o.paid || 0).toLocaleString()}`,
              `Balance: Rs. ${Number(o.balance || 0).toLocaleString()}`,
              `Status: ${o.payment_status || "Unpaid"}`
            ]
            const textStream = `BT /F1 16 Tf 50 780 Td (Dastarkhwan ERP - #${o.number}) Tj ET ` +
              lines.map((l, i) => `BT /F1 11 Tf 50 ${740 - i * 22} Td (${l.replace(/[()]/g, "")}) Tj ET`).join(" ")
            const streamLen = Buffer.byteLength(textStream)
            const pdfDoc = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n4 0 obj << /Length ${streamLen} >>\nstream\n${textStream}\nendstream\nendobj\n5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000244 00000 n \n0000000300 00000 n \ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n368\n%%EOF`
            res.writeHead(200, {
              "Content-Type": "application/pdf",
              "Content-Disposition": 'attachment; filename="' + o.number + '-r' + revision + '-' + size + '.pdf"',
            })
            res.end(Buffer.from(pdfDoc))
          }
          child.on("error", () => sendFallbackPdf())
          child.on("close", (code) => {
            if (res.writableEnded) return
            if (code !== 0) {
              return sendFallbackPdf()
            }
            res.writeHead(200, {
              "Content-Type": "application/pdf",
              "Content-Disposition":
                'attachment; filename="' +
                o.number +
                "-r" +
                revision +
                "-" +
                size +
                '.pdf"',
            })
            res.end(Buffer.concat(chunks))
          })
          child.stdin.end(JSON.stringify(o))
          return
        }

        const lang = url.searchParams.get("lang") || "ur"
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
        res.end(invoiceView(o, size, parts[4] === "kitchen", lang))
        return
      }

      const route = path.slice(5)

      if (req.method === "GET" && route === "bootstrap")
        return json(res, 200, app.call(u, route, {}))

      if (req.method !== "POST") fail("Method not allowed", 405)

      const b = await body(req)
      return json(
        res,
        200,
        app.call(u, route, b, req.headers["idempotency-key"]),
      )
    }

    if (path.startsWith("/media/")) {
      const name = basename(path)
      if (!/^[a-z0-9-]+\.(jpg|woff2|ttf|html|svg|png|webp)$/.test(name)) fail("Not found", 404)
      const file = resolve(here, "media", name)
      if (!existsSync(file)) fail("Not found", 404)
      res.writeHead(200, {
        "Content-Type":
          extname(file) === ".svg" ? "image/svg+xml" : extname(file) === ".png" ? "image/png" : extname(file) === ".webp" ? "image/webp" : extname(file) === ".html" ? "text/html; charset=utf-8" : extname(file) === ".jpg"
            ? "image/jpeg"
            : extname(file) === ".ttf"
              ? "font/ttf"
              : "font/woff2",
        "Cache-Control": "public,max-age=86400",
      })
      createReadStream(file).pipe(res)
      return
    }

    if (path.startsWith("/uploads/")) {
      const name = basename(path)
      if (!/^[a-f0-9]{32}\.(png|jpeg|webp)$/.test(name)) fail("Not found", 404)
      const file = resolve(here, "data/uploads", name)
      if (!existsSync(file)) fail("Not found", 404)
      res.writeHead(200, {
        "Content-Type": {
          ".png": "image/png",
          ".jpeg": "image/jpeg",
          ".webp": "image/webp",
        }[extname(file)],
        "Cache-Control": "public,max-age=31536000,immutable",
      })
      createReadStream(file).pipe(res)
      return
    }

    if (vite)
      return vite.middlewares(req, res, () =>
        json(res, 404, { error: "Not found" }),
      )

    const distDir = resolve(here, "../dist")
    const buildDir = resolve(here, "build")
    const root = existsSync(distDir) ? distDir : buildDir
    const file = resolve(root, "." + decodeURIComponent(path))
    if (
      !file.startsWith(root + "/") &&
      !file.startsWith(root + "\\") &&
      file !== root
    )
      fail("Not found", 404)
    const target =
      existsSync(file) && statSync(file).isFile()
        ? file
        : resolve(root, "index.html")
    res.writeHead(200, {
      "Content-Type":
        {
          ".html": "text/html",
          ".js": "application/javascript",
          ".css": "text/css",
          ".svg": "image/svg+xml",
          ".png": "image/png",
        }[extname(target)] || "application/octet-stream",
    })
    createReadStream(target).pipe(res)
  } catch (e) {
    if (e.code === "ERR_SQLITE_ERROR" && /UNIQUE/.test(e.message))
      return json(res, 409, { error: "Record already exists or is in use" })
    if (e.status !== 401) console.error(e.status ? "API: " + e.message : e)
    if (!res.writableEnded)
      json(res, e.status || 500, {
        error: e.status
          ? e.message
          : "Server error; no transaction was committed",
      })
  }
})

let vite = null

if (!production) {
  const { createServer } = await import("vite")
  vite = await createServer({
    root: resolve(here, ".."),
    server: {
      middlewareMode: true,
      hmr: { server },
      watch: {
        ignored: [
          "**/src/data/**",
          "**/src/output/**",
          "**/src/test-results/**",
          "**/src/tests/**",
          "**/src/build/**",
          "**/src/node_modules/**",
        ],
      },
    },
    appType: "spa",
  })
}

server.listen(port, host, () =>
  console.log(
    "Dastarkhwan ERP: http://" +
      host +
      ":" +
      port +
      " (" +
      (production ? "production" : "development") +
      ")",
  ),
)

if (!production || process.env.DUAL_PORT === "1") {
  const altServer = http.createServer((req, res) => server.emit("request", req, res))
  altServer.on("upgrade", (req, socket, head) => server.emit("upgrade", req, socket, head))
  altServer.listen(altPort, host, () =>
    console.log("Dastarkhwan ERP dual port: http://" + host + ":" + altPort),
  ).on("error", () => {})
}

for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close()
    altServer.close()
    vite?.close()
    app.db.close()
    process.exit(0)
  })
