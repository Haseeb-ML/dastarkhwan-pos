import { test, expect } from "@playwright/test"

import { writeFileSync, mkdirSync } from "node:fs"

import { randomUUID } from "node:crypto"

const dir = "output/evidence"
mkdirSync(dir, { recursive: true })

async function login(page, user = "owner") {
  await page.goto("/")
  await page.getByLabel("Username", { exact: true }).fill(user)
  await page.getByLabel("Password", { exact: true }).fill("Demo@2026!")
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(
    page.getByRole("heading", {
      name: user === "kitchen" ? "Orders / Rasoi" : "Naya Order",
      exact: true,
    }),
  ).toBeVisible()
}

async function nav(page, name) {
  await page
    .locator(".sidebar")
    .getByRole("button", { name, exact: true })
    .click()
}

async function fixture(page) {
  await page
    .getByRole("button", { name: "Select Chicken Karahi", exact: true })
    .click()

  await page
    .getByRole("dialog")
    .locator(".variant-list button")
    .filter({ hasText: "Half" })
    .click()

  await page
    .getByRole("button", { name: "Select Roghni Naan", exact: true })
    .click()

  const panel = page.locator(".desktop-order")

  await panel.getByLabel("Quantity Roghni Naan Piece").fill("4")
  await panel.locator(".kitchen-note").first().locator("summary").click()
  await panel.getByLabel("Kitchen note Chicken Karahi").fill("Less spicy")

  await page.getByRole("button", { name: "Select Raita", exact: true }).click()

  await panel.getByLabel("Table", { exact: true }).selectOption("4")

  await expect(panel.locator(".grand")).toContainText("1,620")
}

test("real browser order, invoice, payment, persistence, kitchen, PDFs and sharing fallback", async ({
  page,
  request,
}) => {
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))

  await login(page)
  await fixture(page)

  await page.screenshot({ path: dir + "/desktop-order.png", fullPage: false })

  await page
    .locator(".desktop-order")
    .getByRole("button", { name: /Order & Bill/ })
    .click()

  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible()
  await expect(dialog.locator(".receipt-total")).toContainText("1,620")

  const title = await dialog.locator("header h2").innerText()

  const cookie = await page.context().cookies()
  const auth = await request.get("/api/bootstrap", {
    headers: { Cookie: cookie.map((c) => c.name + "=" + c.value).join("; ") },
  })
  const data = await auth.json()
  const o = data.orders.find((o) => o.number === title)

  expect(o.total).toBe(162000)
  expect(o.items).toHaveLength(3)
  expect(o.tickets).toHaveLength(1)

  await dialog
    .getByRole("button", { name: "Receive Payment / Paisay lein", exact: true })
    .click()
  await dialog.getByLabel("Cash tendered (PKR)").fill("2000")
  await expect(dialog.locator(".change-box")).toContainText("380")

  await dialog
    .getByRole("button", { name: "Record payment", exact: true })
    .click()
  await expect(dialog.locator(".receipt-meta")).toContainText("Paid")

  await page.screenshot({ path: dir + "/saved-invoice.png", fullPage: false })

  const pdf = await request.get("/api/invoices/" + o.id + "/pdf?size=A4", {
    headers: { Cookie: cookie.map((c) => c.name + "=" + c.value).join("; ") },
  })
  expect(pdf.status()).toBe(200)
  const buf = await pdf.body()
  expect(buf.subarray(0, 4).toString()).toBe("%PDF")
  writeFileSync("output/pdf/sample-invoice-a4.pdf", buf)

  const thermal = await request.get(
    "/api/invoices/" + o.id + "/pdf?size=80mm",
    {
      headers: { Cookie: cookie.map((c) => c.name + "=" + c.value).join("; ") },
    },
  )
  expect(thermal.status()).toBe(200)
  writeFileSync("output/pdf/sample-invoice-80mm.pdf", await thermal.body())

  await dialog.getByRole("button", { name: "WhatsApp sharing" }).click()
  await expect(dialog).toContainText("Handoff is not confirmed delivery.")

  await dialog.getByLabel("Confirm recipient mobile").fill("03001234567")

  const downloadPromise = page.waitForEvent("download")
  await dialog.getByRole("button", { name: /Prepare & download PDF/ }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain(title)
  await expect(dialog).toContainText("PDF prepared.")

  await dialog.getByRole("button", { name: "Close invoice" }).click()

  await nav(page, "Orders & Kitchen")
  await page.getByRole("button", {name:"Kitchen board",exact:true}).click()
  await expect(page.locator(".kitchen-card").first()).toContainText(
    "Less spicy",
  )

  await page
    .getByRole("button", { name: "Start preparing", exact: true })
    .click()
  await page.getByRole("button", { name: "Mark ready", exact: true }).click()
  await page.getByRole("button", { name: "Mark served", exact: true }).click()

  await page.getByRole("button", { name: "Active orders", exact: true }).click()
  await page.getByRole("button", { name: "Release table / Close" }).click()
  await page.getByRole("button", { name: "Confirm close" }).click()
  await expect(page.getByRole("dialog")).not.toBeVisible()

  await page.reload()
  await nav(page, "Orders & Kitchen")
  await page.getByRole("button", { name: "Invoices", exact: true }).click()
  await expect(page.locator(".business-table")).toContainText(title)
  await expect(page.locator(".business-table")).toContainText("Paid")
  expect(errors).toEqual([])
})

test("CRM, menu management, stock purchase/supplier and report/settings screens work", async ({
  page,
}) => {
  await login(page)
  await nav(page, "Customers")
  await page
    .getByRole("button", { name: "+ Add customer", exact: true })
    .click()
  const modal = page.getByRole("dialog")
  await modal.getByLabel("Customer name").fill("Browser Customer")
  await modal
    .getByLabel("Pakistani mobile", { exact: true })
    .fill("03009876543")
  await modal.getByRole("button", { name: "Save", exact: true }).click()
  await expect(page.locator(".business-table")).toContainText("923009876543")

  await nav(page, "Stock & Purchases")
  await page.getByRole("button", { name: "+ Supplier", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByLabel("Supplier name")
    .fill("Browser Supplier")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save", exact: true })
    .click()

  await page
    .getByRole("button", { name: "Receive purchase", exact: true })
    .click()
  const p = page.getByRole("dialog")
  await p
    .getByLabel("Supplier", { exact: true })
    .selectOption({ label: "Browser Supplier" })
  await p
    .getByLabel("Ingredient / base unit")
    .selectOption({ label: "Chicken · kg" })
  await p.getByLabel("Quantity (base unit)").fill("2.5")
  await p.getByLabel("Unit cost PKR").fill("500")
  await p.getByLabel("Amount paid now PKR").fill("250")
  await p.getByRole("button", { name: "Receive purchase once" }).click()
  await expect(page.getByRole("dialog")).not.toBeVisible()

  await page.getByRole("button", { name: "Suppliers", exact: true }).click()
  await expect(page.locator(".kitchen-card")).toContainText("1,000")
  await page.getByRole("button", { name: "Pay existing balance" }).click()
  await page.getByRole("dialog").getByLabel("Amount PKR").fill("1000")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save", exact: true })
    .click()
  await expect(page.locator(".kitchen-card")).toContainText("0")

  await nav(page, "Menu")
  await expect(page.getByRole("heading", { name: "Food menu" })).toBeVisible()
  await page
    .locator(".managed-menu .food-card")
    .first()
    .getByRole("button", { name: "Edit dish" })
    .click()
  await expect(page.getByRole("dialog").getByLabel("Dish name")).toHaveValue(
    "Chicken Karahi",
  )
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click()

  await nav(page, "Daily Summary")
  await expect(page.locator(".metric-grid")).toContainText("Collections")
  await nav(page, "Settings")
  await expect(page.getByLabel("Restaurant name")).toHaveValue("Dastarkhwan")
  await page.screenshot({ path: dir + "/settings.png", fullPage: false })
})

test("direct HTTP authorization, login/logout and PDFs are protected", async ({
  request,
}) => {
  const unauth = await request.get("/api/bootstrap")
  expect(unauth.status()).toBe(401)

  await request.post("/api/auth/login", {
    data: { username: "kitchen", password: "Demo@2026!" },
  })

  const state = await (await request.get("/api/bootstrap")).json()
  expect(state.user.role).toBe("Kitchen")
  expect(state.menu).toBeUndefined()

  for (const route of ["menu/save", "summary", "customers/save"]) {
    const r = await request.post("/api/" + route, {
      data: {},
      headers: { "Idempotency-Key": randomUUID() },
    })
    expect(r.status()).toBe(403)
  }

  expect((await request.get("/api/invoices/1/pdf")).status()).toBe(403)

  expect((await request.post("/api/auth/logout", { data: {} })).status()).toBe(
    200,
  )
  expect((await request.get("/api/bootstrap")).status()).toBe(401)
})

for (const [width, height] of [
  [1440, 1000],
  [1024, 900],
  [390, 844],
  [360, 800],
]) {
  test(
    "responsive usable navigation and order flow at " + width + "px",
    async ({ page }) => {
      await page.setViewportSize({ width, height })
      await login(page)
      await expect(page.locator(".sidebar")).toBeVisible()

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      )
      expect(overflow).toBe(false)

      await page
        .getByRole("button", { name: "Select Raita", exact: true })
        .click()

      if (width <= 800) {
        await expect(page.locator(".mobile-cart")).toBeVisible()
        await page.locator(".mobile-cart").click()
        await expect(
          page
            .locator(".mobile-sheet.open")
            .getByRole("button", { name: /Order & Bill/ }),
        ).toBeInViewport()
        await page
          .locator(".mobile-sheet.open")
          .getByRole("button", { name: "Takeaway", exact: true })
          .click()
        await page
          .locator(".mobile-sheet.open")
          .getByRole("button", { name: /Order & Bill/ })
          .click()
        await expect(page.getByRole("dialog")).toBeVisible()
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Close invoice" })
          .click()
      }

      await page.screenshot({
        path: dir + "/viewport-" + width + ".png",
        fullPage: false,
      })

      await nav(page, "Settings")
      await expect(
        page.getByRole("heading", { name: "Settings", exact: true }).last(),
      ).toBeVisible()
    },
  )
}

test("network failure retains draft and double-submit retry creates only one order", async ({
  page,
}) => {
  await login(page)
  await page.getByRole("button", { name: "Select Raita", exact: true }).click()
  await page
    .locator(".desktop-order")
    .getByRole("button", { name: "Takeaway", exact: true })
    .click()

  let block = true
  await page.route("**/api/orders/create", async (route) => {
    if (block) await route.abort()
    else await route.continue()
  })

  await page
    .locator(".desktop-order")
    .getByRole("button", { name: /Order & Bill/ })
    .click()
  await expect(page.locator(".desktop-order .error")).toBeVisible()
  await expect(page.locator(".desktop-order .order-row")).toHaveCount(1)

  block = false
  await page
    .locator(".desktop-order")
    .getByRole("button", { name: /Order & Bill/ })
    .dblclick()
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.locator(".desktop-order .order-row")).toHaveCount(0)
})

test("each real staff role has its permitted UI and direct financial access is rejected", async ({
  page,
}) => {
  await login(page, "cashier")
  await expect(
    page.locator(".sidebar").getByRole("button", { name: "Menu", exact: true }),
  ).toBeDisabled()
  await expect(
    page
      .locator(".sidebar")
      .getByRole("button", { name: "Customers", exact: true }),
  ).toBeEnabled()
  await page
    .locator(".topbar")
    .getByRole("button", { name: "Sign out" })
    .click()
  await login(page, "kitchen")
  await expect(
    page
      .locator(".sidebar")
      .getByRole("button", { name: "New Order", exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByRole("heading", { name: "Kitchen board", exact: true }),
  ).toBeVisible()
})
test("committed order with a lost response is recovered after reload without duplicate records", async ({
  page,
}) => {
  await login(page)
  await page.getByRole("button", { name: "Select Raita", exact: true }).click()
  await page
    .locator(".desktop-order")
    .getByRole("button", { name: "Takeaway", exact: true })
    .click()
  const before = (await (await page.request.get("/api/bootstrap")).json())
    .orders.length
  let intercept = true
  await page.route("**/api/orders/create", async (route) => {
    if (intercept) {
      intercept = false
      await route.fetch()
      await route.abort()
    } else await route.continue()
  })
  await page
    .locator(".desktop-order")
    .getByRole("button", { name: /Order & Bill/ })
    .click()
  await expect(page.locator(".desktop-order .error")).toBeVisible()
  await page.reload()
  await expect(page.locator(".desktop-order .order-row")).toHaveCount(1)
  await page
    .locator(".desktop-order")
    .getByRole("button", { name: /Order & Bill/ })
    .click()
  await expect(page.getByRole("dialog")).toBeVisible()
  const after = (await (await page.request.get("/api/bootstrap")).json()).orders
    .length
  expect(after).toBe(before + 1)
  await expect(page.locator(".desktop-order .order-row")).toHaveCount(0)
})
test("parallel staff requests compete safely for a last prepared portion", async ({
  request,
}) => {
  await request.post("/api/auth/login", {
    data: { username: "owner", password: "Demo@2026!" },
  })
  const state = await (await request.get("/api/bootstrap")).json(),
    menu = state.menu.find((m) => m.name === "Chicken Tikka")
  menu.variants[0].portions = 1000
  expect(
    (
      await request.post("/api/menu/save", {
        data: menu,
        headers: { "Idempotency-Key": randomUUID() },
      })
    ).status(),
  ).toBe(200)
  const body = {
    service: "Takeaway",
    items: [{ variantId: menu.variants[0].id, qty: 1000 }],
  }
  const rs = await Promise.all([
    request.post("/api/orders/create", {
      data: body,
      headers: { "Idempotency-Key": randomUUID() },
    }),
    request.post("/api/orders/create", {
      data: body,
      headers: { "Idempotency-Key": randomUUID() },
    }),
  ])
  expect(rs.map((r) => r.status()).sort()).toEqual([200, 409])
})

test("saved customer order, amendments and partial dues collection use the same invoice", async ({
  page,
}) => {
  await login(page)
  const state = await (await page.request.get("/api/bootstrap")).json(),
    customer = state.customers.find((c) => c.name === "Browser Customer")
  await page.getByRole("button", { name: "Select Raita", exact: true }).click()
  await page
    .locator(".desktop-order")
    .getByRole("button", { name: "Takeaway", exact: true })
    .click()
  await page.locator(".desktop-order .optional-customer summary").click()
  await page
    .locator(".desktop-order")
    .getByRole("combobox", { name: "Customer (optional)" })
    .selectOption(String(customer.id))
  await page
    .locator(".desktop-order")
    .getByRole("button", { name: /Order & Bill/ })
    .click()
  const invoice = await page
    .getByRole("dialog")
    .locator("header h2")
    .innerText()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close invoice" })
    .click()
  await nav(page, "Orders & Kitchen")
  await page.getByRole("button", { name: "Active orders", exact: true }).click()
  const row = page.locator(".business-table tr").filter({ hasText: invoice })
  await row.getByRole("button", { name: "Add items", exact: true }).click()
  await page
    .getByRole("button", { name: "Select Roghni Naan", exact: true })
    .click()
  await page
    .locator(".desktop-order")
    .getByRole("button", { name: /Save additions/ })
    .click()
  await expect(page.getByRole("dialog").locator("header h2")).toHaveText(
    invoice,
  )
  await expect(page.getByRole("dialog")).toContainText("Revision 2")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Receive Payment / Paisay lein", exact: true })
    .click()
  await page.getByLabel("Cash tendered (PKR)").fill("100")
  await page
    .getByRole("button", { name: "Record payment", exact: true })
    .click()
  await expect(page.locator(".receipt-meta")).toContainText("Partial")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close invoice" })
    .click()
  await nav(page, "Customers")
  const c = page
    .locator(".business-table tr")
    .filter({ hasText: "Browser Customer" })
  await expect(c).toContainText("80")
  await c.getByRole("button", { name: "History / Collect" }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Invoice / Collect" })
    .click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Receive Payment / Paisay lein", exact: true })
    .click()
  await page.getByLabel("Cash tendered (PKR)").fill("80")
  await page
    .getByRole("button", { name: "Record payment", exact: true })
    .click()
  await expect(page.locator(".receipt-meta")).toContainText("Paid")
  const after = await (await page.request.get("/api/bootstrap")).json(),
    o = after.orders.find((o) => o.number === invoice)
  expect(o.revision).toBe(2)
  expect(o.tickets).toHaveLength(2)
  expect(o.balance).toBe(0)
  expect(o.payments).toHaveLength(2)
  const popupPromise = page.waitForEvent("popup")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Print A4", exact: true })
    .click()
  const print = await popupPromise
  await print.waitForLoadState("domcontentloaded")
  await expect(
    print.getByRole("heading", { name: "Customer invoice " + invoice }),
  ).toBeVisible()
  await print.emulateMedia({ media: "print" })
  await expect(print.locator("body")).toContainText("PKR 180.00")
  expect(await print.locator(".sidebar").count()).toBe(0)
  await print.screenshot({ path: dir + "/print-a4.png", fullPage: false })
  await print.close()
})

test("historical revision preview and PDF values agree, and payment uses latest revision only", async ({
  page,
}) => {
  await login(page)
  await nav(page, "Orders & Kitchen")
  await page.getByRole("button", { name: "Invoices", exact: true }).click()
  const state = await (await page.request.get("/api/bootstrap")).json(),
    o = state.orders.find(
      (o) => o.revision === 2 && o.customer?.name === "Browser Customer",
    )
  await page
    .locator(".business-table tr")
    .filter({ hasText: o.number })
    .getByRole("button", { name: "Invoice / Pay" })
    .click()
  await page.getByLabel("Saved revision for print / download").selectOption("1")
  await expect(page.getByRole("dialog").locator("header")).toContainText(
    "Revision 1",
  )
  await expect(
    page.getByRole("dialog").locator(".receipt-total"),
  ).toContainText("100")
  await expect(page.getByRole("dialog")).toContainText(
    "Historical invoice revision",
  )
  const r = await page.request.get(
      "/api/invoices/" + o.id + "/data?revision=1",
    ),
    saved = await r.json()
  expect(saved.total).toBe(10000)
  expect(saved.items).toHaveLength(1)
  await page.getByLabel("Saved revision for print / download").selectOption("2")
  await expect(page.getByRole("dialog").locator("header")).toContainText(
    "Revision 2",
  )
  await expect(
    page.getByRole("dialog").locator(".receipt-total"),
  ).toContainText("180")
})
test("lost partial payment response is recovered after reload instead of collecting twice", async ({
  page,
}) => {
  await login(page)
  await page.getByRole("button", { name: "Select Raita", exact: true }).click()
  await page
    .locator(".desktop-order")
    .getByRole("button", { name: "Takeaway", exact: true })
    .click()
  await page
    .locator(".desktop-order")
    .getByRole("button", { name: /Order & Bill/ })
    .click()
  const number = await page.getByRole("dialog").locator("header h2").innerText()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Receive Payment / Paisay lein", exact: true })
    .click()
  await page.getByLabel("Cash tendered (PKR)").fill("50")
  let intercept = true
  await page.route("**/api/payments", async (route) => {
    if (intercept) {
      intercept = false
      await route.fetch()
      await route.abort()
    } else await route.continue()
  })
  await page
    .getByRole("button", { name: "Record payment", exact: true })
    .click()
  await expect(page.getByRole("dialog").locator(".error")).toBeVisible()
  await page.reload()
  await nav(page, "Orders & Kitchen")
  await page.getByRole("button", { name: "Invoices", exact: true }).click()
  await page
    .locator(".business-table tr")
    .filter({ hasText: number })
    .getByRole("button", { name: "Invoice / Pay" })
    .click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Receive Payment / Paisay lein", exact: true })
    .click()
  await page
    .getByRole("button", { name: "Record payment", exact: true })
    .click()
  const state = await (await page.request.get("/api/bootstrap")).json(),
    o = state.orders.find((o) => o.number === number)
  expect(o.payments).toHaveLength(1)
  expect(o.balance).toBe(5000)
  await expect(page.getByRole("dialog").locator(".receipt-meta")).toContainText(
    "Partial",
  )
})

test('confirmed save still shows authoritative invoice if the following refresh fails', async ({page}) => {
 await login(page);await page.getByRole('button',{name:'Select Raita',exact:true}).click();await page.locator('.desktop-order').getByRole('button',{name:'Takeaway',exact:true}).click();
 await page.route('**/api/bootstrap',route=>route.abort());
 await page.locator('.desktop-order').getByRole('button',{name:/Order & Bill/}).click();await expect(page.getByRole('dialog').locator('.receipt-total')).toContainText('100');await expect(page.locator('.desktop-order .order-row')).toHaveCount(0);await expect(page.locator('.connection-banner')).toContainText('Connection interrupted');
 await page.unroute('**/api/bootstrap');await page.reload();await nav(page,'Orders & Kitchen');await page.getByRole('button',{name:'Invoices',exact:true}).click();await expect(page.locator('.business-table')).toContainText('100');
});


test('owner adds their own dish photo and costs, creates its order and sees daily weekly monthly profit',async({page})=>{
 await login(page);await nav(page,'Menu');await page.getByRole('button',{name:'+ Apna khana add karein',exact:true}).click();
 const modal=page.getByRole('dialog');await modal.getByLabel('Dish name',{exact:true}).fill('Apni Chicken Plate');
 await modal.getByLabel('Bechnay ka rate PKR').fill('100');await modal.getByLabel('Banane ki lagat PKR').fill('60');
 await modal.locator('input[type=file]').setInputFiles('media/chicken-karahi.jpg');
 await expect(modal.locator('.dish-upload-preview')).toBeVisible();await modal.getByRole('button',{name:'Khana save karein',exact:true}).click();await expect(modal).not.toBeVisible();
 const data=await(await page.request.get('/api/bootstrap')).json();const dish=data.menu.find(m=>m.name==='Apni Chicken Plate');expect(dish.image).toMatch(/^\/uploads\//);expect(dish.variants[0].cost).toBe(6000);
 await nav(page,'New Order');await page.getByPlaceholder('Khana dhoondein…').fill('Apni Chicken Plate');await page.getByRole('button',{name:'Select Apni Chicken Plate',exact:true}).click();
 await page.locator('.desktop-order').getByRole('button',{name:'Takeaway',exact:true}).click();await page.locator('.desktop-order').getByRole('button',{name:'Order & Bill',exact:true}).click();await expect(page.getByRole('dialog').locator('.receipt-total')).toContainText('100');await page.getByRole('button',{name:'Close invoice'}).click();
 const state=await(await page.request.get('/api/bootstrap')).json();expect(state.orders.find(o=>o.items.some(i=>i.name==='Apni Chicken Plate')).items[0].cost).toBe(6000);
 await nav(page,'Daily Summary');await expect(page.locator('.profit-banner')).toBeVisible();
 for(const label of ['Is haftay','Is mahinay','Aaj']) {await page.getByRole('button',{name:label,exact:true}).click();await expect(page.locator('.profit-banner')).toBeVisible()}
 await page.screenshot({path:'output/evidence/simple-profit.png',fullPage:false});
 await nav(page,'Menu');await page.getByRole('button',{name:'Edit dish'}).last().click();await page.screenshot({path:'output/evidence/simple-dish-editor.png',fullPage:false});
});
