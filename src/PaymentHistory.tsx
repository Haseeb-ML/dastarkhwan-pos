import {ui, languageDirection} from "./LanguageCore";
﻿import React from "react"
import { urdu } from "./Urdu"
const amount = (value: number) => <span className="ledger-amount"><bdi dir="ltr">{ui(((value || 0) / 100).toLocaleString("en-PK", { maximumFractionDigits: 2 }))}</bdi>{ui(" روپے")}</span>
const date = (value: string) => new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Karachi", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
function Row({ label, children }: { label: string; children: React.ReactNode }) { return <div className="ledger-row"><dt>{ui(label)}</dt><dd>{ui(children)}</dd></div> }
export default function PaymentHistory({ payments, refunds }: { payments: any[]; refunds: any[] }) {
 const entries = [...payments.map(item => ({ ...item, refund: false })), ...refunds.map(item => ({ ...item, refund: true }))].sort((a,b) => new Date(a.created).getTime() - new Date(b.created).getTime())
 return <section className="payment-history ledger-history" dir={languageDirection()}><h4>{ui("رقم کی وصولی اور واپسی کی تفصیل")}</h4>{ui(!entries.length && <p className="ledger-empty">{ui("ابھی کوئی رقم وصول یا واپس نہیں کی گئی۔")}</p>)}{ui(entries.map(item => <article className={`ledger-entry ${item.refund ? "ledger-refund" : ""}`} key={`${item.refund ? "r" : "p"}${item.id}`}>
 <header><strong>{ui(item.refund ? "رقم واپس کی گئی" : "رقم وصول کی گئی")}</strong><span>{ui(urdu(item.method || "Cash"))}</span></header>
 <dl><Row label="تاریخ اور وقت"><bdi dir="ltr">{ui(date(item.created))}</bdi></Row>{ui(item.refund ? <><Row label="واپس کی گئی رقم">{ui(amount(item.amount))}</Row><Row label="واپسی کی وجہ">{ui(item.reason || "—")}</Row></> : <><Row label="گاہک سے وصول شدہ رقم">{ui(amount(item.tendered ?? item.amount))}</Row><Row label="بل میں ادا شدہ رقم">{ui(amount(item.amount))}</Row><Row label="گاہک کو واپس کیے گئے پیسے">{ui(amount(item.change))}</Row></>)}</dl>
 </article>))}</section>
}
