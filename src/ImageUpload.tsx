import {ui, languageDirection} from "./LanguageCore";
﻿import React, { useRef, useState } from "react"
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
  if (image.size > 15 * 1024 * 1024) {setError("یہ تصویر بہت بڑی ہے۔ 15 MB سے چھوٹی تصویر منتخب کریں۔");return}
  setBusy(true)
  let bitmap: ImageBitmap | undefined
  try {
   bitmap = await createImageBitmap(image)
   const canvas = document.createElement("canvas"), scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
   canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale)
   canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
   const result = await mutate("uploads", {data: canvas.toDataURL("image/webp", .85)})
   onUpload(result.url); setSelected(true)
  } catch {setError("تصویر نہیں لگ سکی۔ دوبارہ تصویر منتخب کریں۔")}
  finally {bitmap?.close();setBusy(false)}
 }} />
 <button className="picture-select" type="button" disabled={busy} onClick={()=>file.current?.click()}>
 <span className="picture-icon" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></svg></span>
 <span className="picture-copy"><strong>{ui(busy ? "تصویر لگ رہی ہے…" : (selected || current) ? (logo ? "لوگو تبدیل کریں" : "تصویر تبدیل کریں") : (logo ? "یہاں سے لوگو لگائیں" : "یہاں سے تصویر لگائیں"))}</strong><small>{ui(busy ? "براہ کرم تھوڑا انتظار کریں۔" : "اس بٹن پر دبائیں اور اپنے موبائل یا کمپیوٹر سے تصویر چنیں۔")}</small></span>
 <svg className="picture-plus" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
 </button>
 {ui(selected&&!busy&&<p className="picture-success" role="status">{ui("✓ ")}{ui(logo ? "لوگو منتخب ہو گیا ہے۔ تبدیلی محفوظ کرنے کے لیے نیچے محفوظ کریں دبائیں۔" : "تصویر منتخب ہو گئی ہے۔ کھانا محفوظ کرنے کے لیے نیچے محفوظ کریں دبائیں۔")}</p>)}
 {ui(error&&<p className="error" role="alert">{ui(error)}</p>)}
 </div>
}
