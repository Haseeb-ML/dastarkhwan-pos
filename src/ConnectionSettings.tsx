// @ts-nocheck
import React, { useState } from "react";
import { getApiBase } from "./apiConfig";
import { urdu } from "./Urdu";

export default function ConnectionSettings({ onRetry, currentError }: { onRetry: () => void; currentError?: string }) {
  const [showConfig, setShowConfig] = useState(false);
  const [url, setUrl] = useState(() => getApiBase() || "");
  const [savedMsg, setSavedMsg] = useState("");

  const handleSave = (newUrl: string) => {
    const trimmed = newUrl.trim().replace(/\/$/, "");
    if (trimmed) {
      localStorage.setItem("dastarkhwan_api_url", trimmed);
    } else {
      localStorage.removeItem("dastarkhwan_api_url");
    }
    setUrl(trimmed);
    setSavedMsg("سرور کا پتہ محفوظ ہو گیا!");
    setTimeout(() => {
      setSavedMsg("");
      onRetry();
    }, 600);
  };

  return (
    <div className="loading-screen" style={{ padding: "20px", maxWidth: "480px", margin: "auto" }}>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>📶</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: "0 0 8px 0" }}>
          {urdu("سرور سے رابطہ نہیں ہو سکا")}
        </h2>
        {currentError && (
          <p className="error" style={{ fontSize: "0.9rem", margin: "0 0 16px 0", color: "#e11d48" }}>
            {urdu(currentError)}
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
        <button
          type="button"
          className="primary wide"
          onClick={onRetry}
          style={{ padding: "12px", fontSize: "1rem", fontWeight: "600" }}
        >
          {urdu("دوبارہ رابطہ کریں")}
        </button>

        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          style={{
            background: "none",
            border: "1px solid #cbd5e1",
            padding: "8px 12px",
            borderRadius: "6px",
            color: "#475569",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          ⚙️ {urdu(showConfig ? "ترتیب چھپائیں" : "سرور کا پتہ (Backend URL) تبدیل کریں")}
        </button>

        {showConfig && (
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "14px",
              marginTop: "8px",
              textAlign: "right",
              direction: "rtl",
            }}
          >
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>
              {urdu("بیک اینڈ سرور کا ایڈریس:")}
            </label>
            <input
              type="url"
              dir="ltr"
              placeholder="https://dastarkhwan-pos.onrender.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.9rem",
                marginBottom: "8px",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
              <button
                type="button"
                onClick={() => handleSave("http://192.168.18.57:5173")}
                style={{
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                  background: "#e2e8f0",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                📡 لوکل وائی فائی (192.168.18.57)
              </button>
              <button
                type="button"
                onClick={() => handleSave("https://dastarkhwan-pos.onrender.com")}
                style={{
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                  background: "#e2e8f0",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                ☁️ کلاؤڈ سرور (Render)
              </button>
              <button
                type="button"
                onClick={() => handleSave("")}
                style={{
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                  background: "#fee2e2",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  color: "#991b1b",
                }}
              >
                ری سیٹ (Default)
              </button>
            </div>

            {savedMsg && (
              <p style={{ color: "#16a34a", fontSize: "0.85rem", margin: "0 0 8px 0" }}>
                ✓ {urdu(savedMsg)}
              </p>
            )}

            <button
              type="button"
              className="primary wide"
              onClick={() => handleSave(url)}
              style={{ padding: "8px", fontSize: "0.9rem" }}
            >
              {urdu("محفوظ کریں اور کنیکٹ کریں")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
