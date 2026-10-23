import {ui, languageDirection} from "./LanguageCore";
import React, { useRef, useState } from "react";
import { saveImageToIndexedDb } from "./imageCache";

export default function ImageUpload({ onUpload, mutate, kind = "dish", current }: { onUpload: (url: string) => void; mutate: (route: string, data: any) => Promise<any>; kind?: string; current?: string }) {
 const file = useRef<HTMLInputElement>(null)
 const [busy, setBusy] = useState(false), [error, setError] = useState(""), [selected, setSelected] = useState(false)
 const logo = kind === "logo"
 const label = logo ? "ریسٹورنٹ کا لوگو" : "کھانے کی تصویر"
 return <div className="picture-upload" dir={languageDirection()}><span className="picture-label">{ui(label)}</span><input ref={file} type="file" hidden accept="image/png,image/jpeg,image/webp" aria-label={label} disabled={busy} onChange={async event => {
  const image = event.target.files?.[0]; event.target.value = ""
  if (!image) return
  setError("")
  if (!["image/png", "image/jpeg", "image/webp"].includes(image.type)) {setError("براہ کرم JPG، PNG یا WEBP تصویر منتخب کریں۔");return}
  if (image.size > 20 * 1024 * 1024) {setError("یہ تصویر بہت بڑی ہے۔ 20 MB سے چھوٹی تصویر منتخب کریں۔");return}
  setBusy(true)
  let bitmap: ImageBitmap | undefined
  try {
   bitmap = await createImageBitmap(image)
   const canvas = document.createElement("canvas")
   // Max dimension 800px ensures crisp HD display while maintaining light size for Firestore & offline cache (~35KB-55KB)
   const maxDim = 800
   const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
   canvas.width = Math.round(bitmap.width * scale)
   canvas.height = Math.round(bitmap.height * scale)
   const ctx = canvas.getContext("2d")
   if (ctx) {
     ctx.imageSmoothingEnabled = true
     ctx.imageSmoothingQuality = "high"
     ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
   }
   
   let dataUrl = ""
   try {
     dataUrl = canvas.toDataURL("image/webp", 0.82)
   } catch {
     dataUrl = canvas.toDataURL("image/jpeg", 0.82)
   }

   // Cache immediately in local IndexedDB
   await saveImageToIndexedDb(dataUrl.slice(0, 60), dataUrl)

   // Upload and sync to database
   const result = await mutate("uploads", { data: dataUrl, kind, name: image.name })
   const finalUrl = result?.url || dataUrl
   onUpload(finalUrl)
   setSelected(true)
  } catch (err: any) {
    console.error("Image upload error:", err)
    setError("تصویر نہیں لگ سکی۔ دوبارہ تصویر منتخب کریں۔")
  }
  finally {bitmap?.close();setBusy(false)}
 }} />
 <button className="picture-select" type="button" disabled={busy} onClick={()=>file.current?.click()}>
 <span className="picture-icon" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></svg></span>
 <span className="picture-copy"><strong>{ui(busy ? "تصویر لگ رہی ہے…" : (selected || current) ? (logo ? "لوگو تبدیل کریں" : "تصویر تبدیل کریں") : (logo ? "یہاں سے لوگو لگائیں" : "یہاں سے تصویر لگائیں"))}</strong><small>{ui(busy ? "براہ کرم تھوڑا انتظار کریں، تصویر آن لائن ڈیٹا بیس اور کیش میں محفوظ ہو رہی ہے۔" : "اس بٹن پر دبائیں اور اپنے موبائل یا کمپیوٹر سے تصویر چنیں۔")}</small></span>
 <svg className="picture-plus" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
 </button>
 {ui(selected&&!busy&&<p className="picture-success" role="status">{ui("✓ ")}{ui(logo ? "لوگو آن لائن محفوظ ہو گیا۔ تبدیلی پکی کرنے کے لیے نیچے محفوظ کریں دبائیں۔" : "تصویر آن لائن محفوظ اور کیش ہو گئی۔ کھانا محفوظ کرنے کے لیے نیچے محفوظ کریں دبائیں۔")}</p>)}
 {ui(error&&<p className="error" role="alert">{ui(error)}</p>)}
 </div>
}

