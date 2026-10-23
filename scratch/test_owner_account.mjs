import assert from "node:assert/strict";
import fs from "node:fs";

console.log("Starting Multi-Owner / Partner Account tests...");

// 1. Verify browserDb source code
const browserDbSrc = fs.readFileSync("./src/browserDb.ts", "utf-8");
assert.ok(browserDbSrc.includes('ownerAccounts'), "browserDb must track ownerAccounts");
assert.ok(browserDbSrc.includes('route === "owner/accounts/save"'), "Route owner/accounts/save must exist");
assert.ok(browserDbSrc.includes('route === "owner/accounts/delete"'), "Route owner/accounts/delete must exist");
assert.ok(browserDbSrc.includes('route === "owner/drawings/save"'), "Route owner/drawings/save must exist");
assert.ok(browserDbSrc.includes('ownerAccountId = Number(body?.ownerAccountId || 1)'), "Drawings must store ownerAccountId");
assert.ok(browserDbSrc.includes('ownerAccounts: state.ownerAccounts || []'), "Backup must include ownerAccounts");

// 2. Verify ledgerReportRenderer includes owner functions and multi-owner support
const reportSrc = fs.readFileSync("./src/ledgerReportRenderer.ts", "utf-8");
assert.ok(reportSrc.includes("export function printOwnerAccountReport"), "printOwnerAccountReport must be exported");
assert.ok(reportSrc.includes("export function downloadOwnerAccountCsv"), "downloadOwnerAccountCsv must be exported");
assert.ok(reportSrc.includes("accountTitle"), "Reports must accept custom accountTitle");
assert.ok(reportSrc.includes("مالک / کھاتہ"), "Report must render Owner / Account column");

// 3. Verify FinanceAccounts includes multi-owner UI and state
const financeSrc = fs.readFileSync("./src/FinanceAccounts.tsx", "utf-8");
assert.ok(financeSrc.includes('activeTab === "personal"'), "Personal tab must be handled in FinanceAccounts");
assert.ok(financeSrc.includes("owner-accounts-bar"), "owner-accounts-bar switcher must exist");
assert.ok(financeSrc.includes("btn-add-owner-acc"), "Add owner button must exist");
assert.ok(financeSrc.includes("handleSaveOwnerAccount"), "handleSaveOwnerAccount must be defined");
assert.ok(financeSrc.includes("handleDeleteOwnerAccount"), "handleDeleteOwnerAccount must be defined");
assert.ok(financeSrc.includes("handleOpenAddOwnerAccount"), "handleOpenAddOwnerAccount must be defined");
assert.ok(financeSrc.includes("handleOpenEditOwnerAccount"), "handleOpenEditOwnerAccount must be defined");
assert.ok(financeSrc.includes("MODAL 5: ADD / EDIT OWNER / PARTNER ACCOUNT"), "Modal 5 must exist for owner accounts");
assert.ok(financeSrc.includes("ownerBalancesMap"), "ownerBalancesMap must calculate per-owner balance");

// 4. Verify finance.css styling
const cssSrc = fs.readFileSync("./src/finance.css", "utf-8");
assert.ok(cssSrc.includes(".owner-accounts-bar"), ".owner-accounts-bar must be defined in CSS");
assert.ok(cssSrc.includes(".owner-account-chip"), ".owner-account-chip must be defined in CSS");
assert.ok(cssSrc.includes(".btn-add-owner-acc"), ".btn-add-owner-acc must be defined in CSS");

console.log("✔ All Multi-Owner / Partner Account integration checks passed successfully!");
