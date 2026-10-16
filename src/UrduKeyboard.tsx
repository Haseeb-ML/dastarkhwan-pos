import {useLanguage} from "./LanguageSwitch";
﻿import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
const letters = "A:آ a:ا b:ب p:پ t:ت T:ٹ C:ث j:ج c:چ h:ح K:خ d:د D:ڈ Z:ذ r:ر R:ڑ z:ز X:ژ s:س x:ش S:ص J:ض v:ط V:ظ e:ع g:غ f:ف q:ق k:ک G:گ l:ل m:م n:ن N:ں w:و o:ہ H:ھ u:ء y:ی i:ے U:ئ W:ؤ 0:۰ 1:۱ 2:۲ 3:۳ 4:۴ 5:۵ 6:۶ 7:۷ 8:۸ 9:۹ ,:، ?:؟ !:! .:۔".split(" ").map(pair => pair.split(":"))
const mapping = Object.fromEntries(letters)
const words = ["چکن", "مٹن", "بیف", "کڑاہی", "ہانڈی", "بریانی", "پلاؤ", "کباب", "دال", "نان", "رائتہ", "سلاد", "آدھی", "پوری", "کم مرچ", "بغیر نمک"]
function Keyboard({ initial, multiline, onDone, onClose }: { initial: string; multiline: boolean; onDone: (v: string) => void; onClose: () => void }) {
 const [value, setValue] = useState(initial)
 const [phonetic, setPhonetic] = useState(true)
 const editor = useRef<HTMLTextAreaElement>(null)
 const panel = useRef<HTMLDivElement>(null)
 useEffect(() => {
  const previous = document.activeElement as HTMLElement
  const overflow = document.body.style.overflow
  document.body.style.overflow = "hidden"
  const el = editor.current!
  el.focus({ preventScroll: true })
  el.setSelectionRange(el.value.length, el.value.length)
  el.scrollTop = el.scrollHeight
  let active = true
  const revealConfirmation = () => {
    if (active && panel.current) panel.current.scrollTop = panel.current.scrollHeight - panel.current.clientHeight
  }
  const frame = requestAnimationFrame(revealConfirmation)
  document.fonts.ready.then(revealConfirmation)
  return () => {
    active = false
    cancelAnimationFrame(frame)
    document.body.style.overflow = overflow
    previous?.focus({ preventScroll: true })
  }
 }, [])
 const insert = (text: string, backspace = false) => {
  const el = editor.current!; let start = el.selectionStart; const end = el.selectionEnd
  if (backspace && start === end) start = Math.max(0, start - 1)
  setValue(value.slice(0, start) + text + value.slice(end))
  requestAnimationFrame(() => { el.focus({ preventScroll: true }); el.setSelectionRange(start + text.length, start + text.length) })
 }
 return createPortal(<div className="uk-backdrop" onMouseDown={e => { if(e.target === e.currentTarget) onClose() }}><div ref={panel} className="uk-panel" role="dialog" aria-modal="true" aria-labelledby="uk-title" dir="rtl" onKeyDown={e => {
  e.stopPropagation()
  if(e.key === "Escape") { e.preventDefault(); onClose() }
  if(e.key === "Tab") { const nodes = [...panel.current!.querySelectorAll<HTMLElement>("button, textarea")]; const first = nodes[0], last = nodes[nodes.length-1]; if(e.shiftKey && document.activeElement === first) {e.preventDefault(); last.focus()} if(!e.shiftKey && document.activeElement === last) {e.preventDefault(); first.focus()} }
 }}>
 <header className="uk-header"><div><h2 id="uk-title">اردو کی بورڈ</h2><p>لکھیں، پھر OK دبا کر خانے میں شامل کریں</p></div><button type="button" className="uk-close" aria-label="Close Urdu keyboard" onClick={onClose}>×</button></header>
 <div className="uk-tools"><button type="button" aria-pressed={phonetic} onClick={() => {setPhonetic(!phonetic); editor.current?.focus()}}>{phonetic ? "اردو" : "English"} · Physical keyboard</button><button type="button" onClick={() => {setValue(""); editor.current?.focus()}}>صاف کریں</button></div>
 <textarea ref={editor} className="uk-editor" aria-label="Urdu keyboard text" value={value} rows={multiline ? 3 : 2} onChange={e => setValue(e.target.value)} onKeyDown={e => { if(e.key === "Enter" && (!multiline || e.ctrlKey || e.metaKey)) {e.preventDefault(); onDone(value); return} if(phonetic && !e.ctrlKey && !e.metaKey && !e.altKey && !e.nativeEvent.isComposing && mapping[e.key]) {e.preventDefault(); insert(mapping[e.key])} }} />
 <div className="uk-words" aria-label="Food quick words">{words.map(word => <button type="button" key={word} onClick={() => { const start = editor.current!.selectionStart; insert((start > 0 && !/\s/.test(value[start-1]) ? " " : "") + word + " ") }}>{word}</button>)}</div>
 <div className="uk-keys" dir="ltr">{letters.map(([latin, letter]) => <button type="button" key={latin} aria-label={`Type ${letter}`} onClick={() => insert(letter)}><small>{latin}</small><span>{letter}</span></button>)}</div>
 <footer className="uk-actions"><button type="button" className="uk-done" onClick={() => onDone(value)}>✓ OK — شامل کریں</button><button type="button" onClick={() => insert("", true)}>⌫ حذف</button><button type="button" onClick={() => insert(" ")}>Space · فاصلہ</button><button type="button" className="uk-bottom-close" onClick={onClose}>بند کریں</button></footer>
 </div></div>, document.body)
}
export default function UrduInput(props: any) {
 const language = useLanguage();
 const [open, setOpen] = useState(false)
 useEffect(()=>{if(language === "en") setOpen(false)},[language])
 const input = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
 const { as = "input", ...rest } = props
 const eligible = language === "ur" && !rest.disabled && !rest.readOnly && (as === "textarea" || ["text", "search"].includes(rest.type || "text")) && !["numeric", "decimal", "tel", "email"].includes(rest.inputMode) && !/username|quantity|portions|step/i.test(`${rest.name || ""} ${rest.id || ""} ${rest["aria-label"] || ""}`)
 const control = React.createElement(as, {...rest, ref: input})
 if(!eligible) return control
 return <span className="uk-field">{control}<button type="button" className="uk-trigger" aria-label="Open Urdu keyboard" title="اردو کی بورڈ" onClick={e => {e.preventDefault(); setOpen(true)}}>⌨</button>{open && <Keyboard initial={String(input.current?.value || "")} multiline={as === "textarea"} onClose={() => setOpen(false)} onDone={value => {
 const el = input.current!; Object.getOwnPropertyDescriptor(as === "textarea" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, "value")!.set!.call(el, value); el.dispatchEvent(new Event("input", {bubbles: true})); setOpen(false); requestAnimationFrame(() => {el.focus(); el.setSelectionRange(value.length, value.length)})
 }} />}</span>
}

