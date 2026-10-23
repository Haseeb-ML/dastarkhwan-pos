// @ts-nocheck
import { ui, languageDirection } from "./LanguageCore";
import { useLanguage } from "./LanguageSwitch";
import { apiUrl } from "./apiConfig";
// @ts-ignore shared server/browser report formatter
import auditDisplay from "./AuditDisplay";
import React, { useEffect, useState, useRef } from "react";
import BottomClose from "./BottomClose";
import { getImageCacheStats, preloadMenuImages } from "./imageCache";
import { getLocalState } from "./browserDb";


export function AuditLog({ rows }: { rows: any[] }) {
  const lang = useLanguage();
  const isUrdu = lang === "ur";
  return (
    <section className="data-card readable-audit">
      <div className="audit-heading">
        <h3>{isUrdu ? "کس نے کیا کام کیا؟" : "Work Activity History"}</h3>
        <a className="dialog-close-button audit-download" href={apiUrl("/api/audit/export")} download>
          {isUrdu ? "Excel کی فائل لیں" : "Export Excel file"}
        </a>
      </div>
      <div className="audit-explanation">
        <p>{isUrdu ? "یہاں آپ دیکھ سکتے ہیں کہ ہوٹل میں کس نے، کب، کیا کام کیا۔" : "View what activity took place in the restaurant, who performed it, and when."}</p>
        <p>{isUrdu ? "مثلاً: کس نے بل بنایا، پیسے لیے، سامان بدلا یا گاہک کی معلومات درست کیں۔" : "For example: creating bills, collecting payments, stock changes, or customer updates."}</p>
        <small>{isUrdu ? `نیچے آخری ${rows.length} کام دکھائے گئے ہیں۔ فائل میں سارے کام ہوں گے۔` : `Showing the last ${rows.length} actions. All activity is included in the exported file.`}</small>
      </div>
      {!rows.length && <p>{isUrdu ? "ابھی کوئی کام درج نہیں ہوا۔" : "No activity recorded yet."}</p>}
      {rows.map(row => {
        const x = auditDisplay(row);
        return (
          <article key={row.id}>
            <div>
              <strong>{ui(x.action)}</strong>
              <small>{ui(x.actor)}{" · "}<time dir="ltr">{ui(x.date)}</time></small>
            </div>
            {x.details && <p>{ui(x.details)}</p>}
            <span className="audit-reference">{isUrdu ? "حوالہ: " : "Reference: "}{ui(x.reference)}</span>
          </article>
        );
      })}
    </section>
  );
}

export default function DataControls({ mutate, notice }: { mutate: any; notice: any }) {
  const currentLang = useLanguage();
  const isUrdu = currentLang === "ur";

  const [status, setStatus] = useState<any>(null);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [restoreData, setRestoreData] = useState<any>(null);
  const [restoreFile, setRestoreFile] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<{ count: number; sizeBytes: number } | null>(null);
  const [cachingBusy, setCachingBusy] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshCacheStats = async () => {
    try {
      const stats = await getImageCacheStats();
      setCacheStats(stats);
    } catch {}
  };

  const handleCacheAllImages = async () => {
    setCachingBusy(true);
    try {
      const state = getLocalState();
      const urls: string[] = [];
      (state.menu || []).forEach((m: any) => {
        if (m.image) urls.push(m.image);
      });
      if (state.settings?.logo) urls.push(state.settings.logo);
      const count = await preloadMenuImages(urls);
      await refreshCacheStats();
      notice && notice(isUrdu ? `${count} تصاویر کامیابی کے ساتھ کیش ہو گئیں!` : `${count} images successfully cached offline!`);
    } catch (err: any) {
      setError(err?.message || "Failed to cache images");
    } finally {
      setCachingBusy(false);
    }
  };

  const refresh = async () => {
    try {
      const res = await mutate("maintenance/status");
      if (res) {
        setStatus(res);
        return;
      }
    } catch {}

    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("erp_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const r = await fetch(apiUrl("/api/maintenance/status"), {
        method: "POST",
        credentials: "include",
        headers,
        body: "{}",
      });
      const s = await r.json();
      if (!r.ok) throw Error(s.error || (isUrdu ? "معلومات نہیں مل سکیں" : "Failed to load backup status"));
      setStatus(s);
    } catch {
      setStatus({
        enabled: true,
        lastBackup: isUrdu ? "گوگل کلاؤڈ فائرسٹور (لائیو)" : "Google Cloud Firestore (Live)",
        demoAvailable: true,
      });
    }
  };

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
    refreshCacheStats().catch(() => {});
  }, []);


  const downloadBackupFile = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await mutate("maintenance/backup");
      const backupPayload = res?.backup || {
        version: "1.0",
        appName: "Dastarkhwan ERP",
        exportedAt: new Date().toISOString(),
        data: res,
      };

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      a.href = url;
      a.download = `Dastarkhwan_Backup_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notice(isUrdu ? "مکمل بیک اپ فائل ڈاؤن لوڈ ہو گئی۔ اسے محفوظ رکھیں۔" : "Full backup file downloaded successfully. Keep it safe.");
      await refresh();
    } catch (e: any) {
      setError(e.message || (isUrdu ? "بیک اپ ڈاؤن لوڈ نہیں ہو سکا" : "Failed to download backup file"));
    } finally {
      setBusy(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const payload = parsed.data || parsed.backup?.data || parsed.state || parsed;
        if (!payload.orders && !payload.menu && !payload.settings && !payload.ingredients) {
          throw new Error(isUrdu ? "اس فائل میں درست دسترخوان ڈیٹا نہیں ملا۔" : "No valid Dastarkhwan backup data found in this file.");
        }
        setRestoreData(payload);
        setRestoreFile({
          name: file.name,
          size: Math.round(file.size / 1024) + " KB",
          exportedAt: parsed.exportedAt || parsed.timestamp || (isUrdu ? "نامعلوم" : "Unknown"),
          restaurant: parsed.restaurant || payload.settings?.name || "Dastarkhwan",
        });
      } catch (err: any) {
        setError((isUrdu ? "فائل پڑھنے میں غلطی: " : "Error reading file: ") + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmRestore = async () => {
    if (!restoreData) return;
    setBusy(true);
    setError("");
    try {
      await mutate("maintenance/restore", { data: restoreData });
      notice(isUrdu ? "بیک اپ ڈیٹا کامیابی سے بحال ہو گیا! تمام ریکارڈ اپ ڈیٹ ہو گئے۔" : "Backup data restored successfully! All records updated.");
      setRestoreData(null);
      setRestoreFile(null);
      await refresh();
    } catch (e: any) {
      setError(e.message || (isUrdu ? "بیک اپ بحال کرنے میں خرابی ہوئی" : "Error restoring backup"));
    } finally {
      setBusy(false);
    }
  };

  const run = async (action: string, body: any = {}) => {
    setBusy(true);
    setError("");
    try {
      await mutate("maintenance/" + action, body);
      await refresh();
      setConfirm("");
      setDeleteConfirmText("");
      notice(
        action === "delete_all" || action === "wipe"
          ? (isUrdu ? "تمام ڈیٹا کامیابی سے صاف ہو گیا! تمام ریکارڈز اب خالی ہیں۔" : "All data has been completely cleared! All records are now empty.")
          : action === "clear"
          ? (isUrdu ? "ٹیسٹ ڈیٹا صاف ہو گیا۔" : "Test demo data cleared.")
          : action === "fill"
          ? (isUrdu ? "ٹیسٹ ڈیٹا واپس آ گیا۔" : "Test demo data restored.")
          : (isUrdu ? "بیک اپ کی ترتیب محفوظ ہو گئی۔" : "Backup settings saved.")
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="data-card data-controls">
      <div className="section-title">
        <div>
          <h2>{isUrdu ? "مکمل ڈیٹا بیک اپ اور بحالی (Backup & Restore)" : "Backup & Restore"}</h2>
          <p>{isUrdu ? "اپنے کاروبار کے تمام بل، کھانے، سامان اور گاہکوں کا محفوظ بیک اپ فائل لیں یا واپس بحال کریں۔" : "Download a complete backup file of all invoices, menu, stock and customers or restore it anytime."}</p>
        </div>
        <div className="backup-badge cloud">
          <span>☁️ {isUrdu ? "گوگل کلاؤڈ پر محفوظ (Live Cloud Sync Active)" : "Google Cloud Live Sync Active"}</span>
        </div>
      </div>

      <div className="backup-card-grid">
        <article className="backup-action-card">
          <div>
            <h4>📥 {isUrdu ? "بیک اپ فائل ڈاؤن لوڈ کریں" : "Download Backup File"}</h4>
            <p>{isUrdu ? "ایک کلک پر تمام بل، مینو، اسٹاک، سپلائرز، گاہک اور ترتیبات کی .json فائل کمپیوٹر یا فون میں ڈاؤن لوڈ کریں۔" : "Download a full .json backup file of all orders, menu dishes, stock, suppliers, customers, and settings to your computer or phone in one click."}</p>
          </div>
          <button
            type="button"
            className="primary compact"
            disabled={busy}
            onClick={downloadBackupFile}
          >
            {isUrdu ? (busy ? "فائل تیار ہو رہی ہے…" : "مکمل بیک اپ لیں (.json فائل)") : (busy ? "Generating file..." : "Download Full Backup (.json)")}
          </button>
        </article>

        <article className="backup-action-card">
          <div>
            <h4>📤 {isUrdu ? "بیک اپ فائل بحال کریں (Restore)" : "Restore from Backup File"}</h4>
            <p>{isUrdu ? "اگر آپ نے پہلے بیک اپ فائل ڈاؤن لوڈ کی تھی تو اسے منتخب کر کے سارا ریکارڈ چند سیکنڈ میں بحال کریں۔" : "Select a previously downloaded backup file to restore all your records in seconds."}</p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            <button
              type="button"
              className="secondary"
              style={{ margin: 0 }}
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUrdu ? "📁 بیک اپ فائل منتخب کریں" : "📁 Select Backup File (.json)"}
            </button>
          </div>
        </article>

        <article className="backup-action-card">
          <div>
            <h4>🖼️ {isUrdu ? "تصاویر کا آف لائن کیش (Offline Image Cache)" : "Offline Image Cache"}</h4>
            <p>{isUrdu ? "تمام ڈشز اور لوگو کی تصاویر کو ڈیوائس میں محفوظ کریں تاکہ انٹرنیٹ کے بغیر بھی فوری نظر آئیں۔" : "Store all dish and restaurant logo photos permanently on this device for instant offline access."}</p>
            {cacheStats !== null && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "6px 10px", borderRadius: "8px", marginBottom: "12px" }}>
                <small style={{ color: "#166534", fontWeight: 600 }}>
                  ✓ {cacheStats.count} {isUrdu ? "تصاویر محفوظ ہیں" : "images cached"} ({Math.round(cacheStats.sizeBytes / 1024)} KB)
                </small>
              </div>
            )}
          </div>
          <button
            type="button"
            className="secondary"
            style={{ margin: 0 }}
            disabled={cachingBusy}
            onClick={handleCacheAllImages}
          >
            {cachingBusy ? (isUrdu ? "تصاویر کیش ہو رہی ہیں…" : "Caching images...") : (isUrdu ? "⚡ تمام تصاویر آف لائن کیش کریں" : "⚡ Cache All Images Offline")}
          </button>
        </article>

        <article className="backup-action-card danger-card">
          <div>
            <h4 style={{ color: "#dc2626" }}>🗑️ {isUrdu ? "مکمل ڈیٹا ڈیلیٹ کریں (Factory Reset)" : "Delete All Data (Factory Reset)"}</h4>
            <p>{isUrdu ? "تمام آرڈرز، کھانے، سامان/اسٹاک، سپلائرز، گاہک اور اخراجات مکمل صاف کریں۔ نیا کام شروع کرنے کے لیے۔" : "Permanently clear all restaurant data (orders, menu dishes, stock, suppliers, customers, and expenses) to start fresh."}</p>
          </div>
          <button
            type="button"
            className="danger-btn compact"
            style={{ margin: 0, background: "#dc2626", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
            disabled={busy}
            onClick={() => {
              setDeleteConfirmText("");
              setConfirm("delete_all");
            }}
          >
            {isUrdu ? "⚠️ تمام ڈیٹا ڈیلیٹ کریں" : "⚠️ Delete All Data"}
          </button>
        </article>
      </div>


      {status?.lastBackup && (
        <p className="muted" style={{ margin: "10px 0" }}>
          {isUrdu ? "آخری بیک اپ وقت: " : "Last backup: "}
          <span dir="ltr" className="backup-path">
            {status.lastBackup}
          </span>
        </p>
      )}

      {/* Restore Confirmation Dialog */}
      {restoreData && restoreFile && (
        <div className="modal-backdrop">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label={isUrdu ? "بیک اپ بحالی کی تصدیق" : "Restore backup confirmation"}>
            <header>
              <h2>{isUrdu ? "کیا آپ یہ بیک اپ ڈیٹا بحال کرنا چاہتے ہیں؟" : "Do you want to restore this backup data?"}</h2>
              <button
                type="button"
                aria-label="Close"
                disabled={busy}
                onClick={() => {
                  setRestoreData(null);
                  setRestoreFile(null);
                }}
              >
                ×
              </button>
            </header>
            <p>{isUrdu ? "اس فائل سے موجودہ ریکارڈ میں تمام ڈیٹا بحال ہو جائے گا:" : "This file will restore all data into your records:"}</p>

            <div className="restore-preview-box">
              <strong>📄 {restoreFile.name} ({restoreFile.size})</strong>
              <div className="restore-preview-grid">
                <div className="restore-stat">
                  <span>{isUrdu ? "کھانے (Dishes):" : "Dishes:"}</span>
                  <strong>{restoreData.menu?.length || 0}</strong>
                </div>
                <div className="restore-stat">
                  <span>{isUrdu ? "سامان (Ingredients):" : "Ingredients:"}</span>
                  <strong>{restoreData.ingredients?.length || 0}</strong>
                </div>
                <div className="restore-stat">
                  <span>{isUrdu ? "کل آرڈرز (Orders):" : "Total Orders:"}</span>
                  <strong>{restoreData.orders?.length || 0}</strong>
                </div>
                <div className="restore-stat">
                  <span>{isUrdu ? "گاہک (Customers):" : "Customers:"}</span>
                  <strong>{restoreData.customers?.length || 0}</strong>
                </div>
                <div className="restore-stat">
                  <span>{isUrdu ? "سپلائرز (Suppliers):" : "Suppliers:"}</span>
                  <strong>{restoreData.suppliers?.length || 0}</strong>
                </div>
                <div className="restore-stat">
                  <span>{isUrdu ? "اخراجات (Expenses):" : "Expenses:"}</span>
                  <strong>{restoreData.expenses?.length || 0}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button
                type="button"
                className="primary wide"
                disabled={busy}
                onClick={confirmRestore}
              >
                {isUrdu ? (busy ? "بحال ہو رہا ہے…" : "ہاں، یہ بیک اپ بحال کریں") : (busy ? "Restoring..." : "Yes, Restore Backup")}
              </button>
              <button
                type="button"
                className="secondary"
                style={{ width: "120px", marginTop: "12px" }}
                disabled={busy}
                onClick={() => {
                  setRestoreData(null);
                  setRestoreFile(null);
                }}
              >
                {isUrdu ? "منسوخ کریں" : "Cancel"}
              </button>
            </div>
            <BottomClose
              disabled={busy}
              onClose={() => {
                setRestoreData(null);
                setRestoreFile(null);
              }}
            />
          </section>
        </div>
      )}



      {error && (
        <p role="alert" className="error" style={{ marginTop: "12px" }}>
          {error}
        </p>
      )}

      {/* Delete All Data Modal */}
      {confirm === "delete_all" && (
        <div className="modal-backdrop">
          <section
            className="work-modal"
            role="dialog"
            aria-modal="true"
            aria-label={isUrdu ? "تمام ڈیٹا ڈیلیٹ کرنے کی تصدیق" : "Confirm delete all data"}
            style={{ maxWidth: "560px" }}
          >
            <header>
              <h2 style={{ color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>⚠️</span>
                <span>{isUrdu ? "کیا آپ واقعی تمام ڈیٹا ڈیلیٹ کرنا چاہتے ہیں؟" : "Permanently Delete All Data?"}</span>
              </h2>
              <button
                type="button"
                aria-label="Close"
                disabled={busy}
                onClick={() => {
                  setConfirm("");
                  setDeleteConfirmText("");
                }}
              >
                ×
              </button>
            </header>

            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "14px 16px", margin: "14px 0" }}>
              <p style={{ color: "#991b1b", fontWeight: "bold", margin: "0 0 8px 0" }}>
                {isUrdu ? "⚠️ انتباہ: یہ عمل ناقابل واپسی ہے!" : "⚠️ Warning: This action cannot be undone!"}
              </p>
              <ul style={{ margin: "0", paddingInlineStart: "20px", color: "#7f1d1d", fontSize: "14px", lineHeight: "1.8" }}>
                <li>{isUrdu ? "تمام بل اور آرڈر ہسٹری صاف ہو جائے گی۔" : "All sales orders, receipts, and order history will be deleted."}</li>
                <li>{isUrdu ? "تمام کھانے اور مینو لسٹ ختم ہو جائے گی۔" : "All dishes, pricing, and menu categories will be cleared."}</li>
                <li>{isUrdu ? "تمام سامان، اسٹاک اور سپلائرز صاف ہو جائیں گے۔" : "All ingredients, stock counts, and supplier records will be wiped."}</li>
                <li>{isUrdu ? "تمام گاہک اور ادھار کا ریکارڈ ختم ہو جائے گا۔" : "All customer records, phone numbers, and balances will be removed."}</li>
                <li>{isUrdu ? "تمام اخراجات اور کیش رجسٹرز ختم ہو جائیں گے۔" : "All business expenses and cash register sessions will be erased."}</li>
              </ul>
            </div>

            <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "12px" }}>
              💡 {isUrdu
                ? "مشورہ: ڈیٹا ڈیلیٹ کرنے سے پہلے نیچے بٹن دبا کر بیک اپ فائل اپنے پاس ڈاؤن لوڈ کر لیں۔"
                : "Tip: Download a full backup file first so you can restore your records if ever needed."}
            </p>

            <button
              type="button"
              className="secondary wide"
              style={{ marginBottom: "16px", borderColor: "#cbd5e1" }}
              disabled={busy}
              onClick={downloadBackupFile}
            >
              {isUrdu ? "📥 پہلے بیک اپ فائل ڈاؤن لوڈ کریں (.json)" : "📥 Download Backup File First (.json)"}
            </button>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#1e293b" }}>
                {isUrdu ? 'تصدیق کے لیے نیچے خانے میں "DELETE" لکھیں:' : 'Type "DELETE" below to confirm:'}
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                dir="ltr"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "2px solid #ef4444",
                  fontSize: "16px",
                  fontWeight: "bold",
                  letterSpacing: "2px",
                  boxSizing: "border-box",
                  marginBottom: "14px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="danger-btn wide"
                style={{
                  background: deleteConfirmText.trim().toUpperCase() === "DELETE" ? "#dc2626" : "#f87171",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: deleteConfirmText.trim().toUpperCase() === "DELETE" && !busy ? "pointer" : "not-allowed",
                  opacity: deleteConfirmText.trim().toUpperCase() === "DELETE" ? 1 : 0.6,
                }}
                disabled={busy || deleteConfirmText.trim().toUpperCase() !== "DELETE"}
                onClick={() => run("delete_all", { confirm: "delete_all" })}
              >
                {busy
                  ? (isUrdu ? "ڈیٹا صاف ہو رہا ہے…" : "Clearing data...")
                  : (isUrdu ? "🗑️ ہاں، تمام ڈیٹا مکمل ڈیلیٹ کریں" : "🗑️ Yes, Permanently Delete All Data")}
              </button>
              <button
                type="button"
                className="secondary"
                style={{ minWidth: "100px" }}
                disabled={busy}
                onClick={() => {
                  setConfirm("");
                  setDeleteConfirmText("");
                }}
              >
                {isUrdu ? "منسوخ" : "Cancel"}
              </button>
            </div>

            <BottomClose
              disabled={busy}
              onClose={() => {
                setConfirm("");
                setDeleteConfirmText("");
              }}
            />
          </section>
        </div>
      )}


    </section>
  );
}
