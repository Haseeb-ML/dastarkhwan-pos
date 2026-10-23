import { test } from "node:test"

import assert from "node:assert/strict"

import { spawnSync } from "node:child_process"

import { mkdirSync, writeFileSync } from "node:fs"

import { openERP } from "../erp.mjs"

import { randomUUID } from "node:crypto"

mkdirSync("output/pdf", { recursive: true })

const a = openERP(":memory:", { seed: true }),
  u = a.one("SELECT * FROM users WHERE role='Owner'")

const call = (r, b) => a.call(u, r, b, randomUUID())

const items = [
  { variantId: 1, qty: 1000 },
  {
    variantId: a.menu().find((m) => m.name === "Roghni Naan").variants[0].id,
    qty: 4000,
  },
  {
    variantId: a.menu().find((m) => m.name === "Raita").variants[0].id,
    qty: 1000,
  },
]

let o = call("orders/create", { service: "Takeaway", items })
o = call("payments", { id: o.id, version: 1, amount: 200000, method: "Cash" })

function generate(o, size, path) {
  const child = spawnSync("python", ["invoice_pdf.py", size], {
    input: JSON.stringify(o),
    maxBuffer: 20 * 1024 * 1024,
  })
  assert.equal(child.status, 0, child.stderr?.toString())
  assert.equal(child.stdout.subarray(0, 4).toString(), "%PDF")
  writeFileSync(path, child.stdout)
  const check = spawnSync(
    "python",
    [
      "-c",
      "import pymupdf,json,sys; d=pymupdf.open(sys.argv[1]); print(json.dumps({'pages':len(d),'width':d[0].rect.width,'text':'\\n'.join(p.get_text() for p in d),'fonts':[f[3] for f in d[0].get_fonts()]}))",
      path,
    ],
    { encoding: "utf8" },
  )
  assert.equal(check.status, 0, check.stderr)
  return JSON.parse(check.stdout)
}

const pythonCheck = spawnSync("python", ["-c", "import reportlab, pymupdf; print('OK')"], { encoding: "utf8" })
const hasPython = pythonCheck.status === 0 && pythonCheck.stdout?.trim() === "OK"
const skipReason = { skip: !hasPython && "Python ReportLab/PyMuPDF unavailable in this environment" }

test("A4 invoice has authoritative amounts, selectable text and embedded fonts", skipReason, () => {
  const d = generate(o, "A4", "output/pdf/sample-invoice-a4.pdf")
  assert.equal(d.pages, 1)
  assert.ok(d.text.includes("PKR 1,620.00"))
  assert.ok(d.text.includes("PKR 380.00"))
  assert.ok(d.fonts.some((n) => n.includes("Arial") || n.includes("DMSans")))
  assert.ok(d.text.includes("Outstanding balance"))
})

test("80mm receipt is one continuous page with the same saved values", skipReason, () => {
  const d = generate(o, "80mm", "output/pdf/sample-invoice-80mm.pdf")
  assert.equal(d.pages, 1)
  assert.ok(Math.abs(d.width - 226.77) < 1)
  assert.ok(d.text.includes("PKR 1,620.00"))
  assert.ok(d.text.includes("PKR 380.00"))
})

test("long invoice paginates with repeated headings and no missing line totals", skipReason, () => {
  const m = a.menu()[0]
  m.name =
    "Traditional special slow cooked chicken karahi with fresh tomatoes, ginger, herbs and coriander for a family gathering"
  call("menu/save", m)

  const long = call("orders/create", {
    service: "Takeaway",
    items: Array.from({ length: 90 }, () => ({ variantId: 1, qty: 1000 })),
  })

  const d = generate(long, "A4", "output/pdf/sample-invoice-long.pdf")
  assert.ok(d.pages >= 3)
  assert.equal((d.text.match(/Traditional special/g) || []).length, 90)
  assert.ok((d.text.match(/ITEM \/ VARIANT/g) || []).length >= d.pages - 1)
  assert.ok(d.text.includes("PKR 108,000.00"))
})

test("Urdu names use an embedded Arabic font with shaped glyphs", skipReason, () => {
  const m = a.menu()[0]
  m.name = "\u0686\u06a9\u0646 \u06a9\u0691\u0627\u06c1\u06cc"
  call("menu/save", m)
  const urdu = call("orders/create", {
    service: "Takeaway",
    items: [{ variantId: 1, qty: 1000 }],
  })
  const d = generate(urdu, "A4", "output/pdf/sample-invoice-urdu.pdf")
  assert.ok(d.fonts.some((n) => n.includes("NotoSansArabic")))
  assert.equal(d.pages, 1)
})

test.after(() => a.db.close())
