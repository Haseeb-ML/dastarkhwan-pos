import { test } from "node:test"

import assert from "node:assert/strict"

import { spawn } from "node:child_process"

import { mkdtempSync, rmSync } from "node:fs"

import { tmpdir } from "node:os"

import { join, resolve, sep } from "node:path"

import { randomUUID } from "node:crypto"

const base = "http://127.0.0.1:5209"

test("production onboarding, secure sessions, protected API, build assets and restart persistence", async () => {
  const root = mkdtempSync(join(tmpdir(), "erp-http-")),
    file = join(root, "production.sqlite"),
    setup = randomUUID()
  let child

  const start = async () => {
    child = spawn(process.execPath, ["server.mjs"], {
      env: {
        ...process.env,
        NODE_ENV: "production",
        ERP_PORT: "5209",
        ERP_HOST: "127.0.0.1",
        ERP_DB: file,
        ERP_SEED: "0",
        ERP_SETUP_TOKEN: setup,
      },
      stdio: "pipe",
      windowsHide: true,
    })

    let errors = ""
    child.stderr.on("data", (b) => {
      errors += b.toString()
    })
    child.stdout.on("data", () => {})

    for (let i = 0; i < 80; i++) {
      if (child.exitCode !== null) throw new Error(errors)
      try {
        const r = await fetch(base + "/api/health")
        if (r.ok) return
      } catch {}
      await new Promise((r) => setTimeout(r, 100))
    }
    throw new Error("Production startup failed: " + errors)
  }

  const stop = async () => {
    if (!child || child.exitCode !== null) return
    const done = new Promise((r) => child.once("exit", r))
    child.kill()
    await done
  }

  let cookie = ""

  const get = async (path) =>
    fetch(base + "/api/" + path, { headers: cookie ? { Cookie: cookie } : {} })

  const post = async (path, data, headers = {}) =>
    fetch(base + "/api/" + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
        ...(cookie ? { Cookie: cookie } : {}),
        ...headers,
      },
      body: JSON.stringify(data),
    })

  try {
    await start()
    let health = await (await get("health")).json()
    assert.equal(health.mode, "production")
    assert.equal(health.setupRequired, true)
    assert.equal((await get("bootstrap")).status, 401)

    assert.equal(
      (
        await post("auth/setup", {
          setupToken: "invalid",
          username: "owner",
          name: "Real Owner",
          password: "A-test-password!",
        })
      ).status,
      403,
    )

    assert.equal(
      (
        await post("auth/setup", {
          setupToken: setup,
          username: "owner",
          name: "Real Owner",
          password: "A-test-password!",
        })
      ).status,
      201,
    )

    assert.equal(
      (
        await post("auth/setup", {
          setupToken: setup,
          username: "other",
          name: "Other",
          password: "A-test-password!",
        })
      ).status,
      409,
    )

    assert.equal(
      (
        await post("auth/login", {
          username: "' OR 1=1 --",
          password: "A-test-password!",
        })
      ).status,
      401,
    )

    const login = await post("auth/login", {
      username: "owner",
      password: "A-test-password!",
    })
    assert.equal(login.status, 200)
    const set = login.headers.get("set-cookie")
    assert.ok(set.includes("HttpOnly"))
    assert.ok(set.includes("SameSite=Strict"))
    cookie = set.split(";")[0]

    const initial = await (await get("bootstrap")).json()
    for (const field of [
      "menu",
      "orders",
      "customers",
      "ingredients",
      "suppliers",
      "expenses",
    ])
      assert.equal(initial[field].length, 0)
    assert.equal(initial.staff.length, 1)

    assert.equal((await fetch(base + "/")).status, 200)
    assert.equal((await fetch(base + "/media/karahi.jpg")).status, 200)
    assert.equal((await fetch(base + "/media/dm-sans-400.ttf")).status, 200)

    const menu = await (
      await post("menu/save", {
        name: "Client dish",
        category: "Client menu",
        image: "/media/karahi.jpg",
        available: true,
        variants: [
          {
            name: "Regular",
            unit: "piece",
            price: 10000,
            step: 1000,
            portions: null,
          },
        ],
      })
    ).json()

    const state = await (await get("bootstrap")).json(),
      v = state.menu.find((m) => m.id === menu.id).variants[0]

    const o = await (
      await post("orders/create", {
        service: "Takeaway",
        items: [{ variantId: v.id, qty: 1000 }],
      })
    ).json()
    assert.equal(o.total, 10000)

    assert.equal(
      (
        await post(
          "payments",
          { id: o.id, version: 1, amount: 10000, method: "Cash" },
          { Origin: "https://evil.example" },
        )
      ).status,
      403,
    )

    assert.equal(
      (
        await post("payments", {
          id: o.id,
          version: 1,
          amount: 10000,
          method: "Cash",
        })
      ).status,
      200,
    )

    await stop()
    await start()
    health = await (await get("health")).json()
    assert.equal(health.setupRequired, false)
    const saved = await (await get("bootstrap")).json()
    assert.equal(saved.orders.length, 1)
    assert.equal(saved.orders[0].balance, 0)
    assert.equal(saved.menu[0].name, "Client dish")

    const pdf = await get("invoices/" + o.id + "/pdf")
    assert.equal(pdf.status, 200)
    assert.equal(
      Buffer.from(await pdf.arrayBuffer())
        .subarray(0, 4)
        .toString(),
      "%PDF",
    )

    assert.equal((await post("auth/logout", {})).status, 200)
    assert.equal((await get("bootstrap")).status, 401)
  } finally {
    await stop()
    if (resolve(root).startsWith(resolve(tmpdir()) + sep))
      rmSync(root, { recursive: true, force: true })
  }
})
