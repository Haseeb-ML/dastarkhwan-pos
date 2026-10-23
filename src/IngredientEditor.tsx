import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import items from "./desi-ingredients.json";
import UrduInput from "./UrduKeyboard";
import { urdu } from "./Urdu";
import { useLanguage } from "./LanguageSwitch";
import { languageDirection } from "./LanguageCore";

const norm = (s: string) => s.toLowerCase().normalize('NFKC').replace(/[\u064b-\u065f]/g, '').trim();

export default function IngredientEditor({ initial, ingredients, Form, fields, submit }: { initial: any; ingredients: any[]; Form: any; fields: any; submit: any }) {
  const lang = useLanguage();
  const isUrdu = lang === "ur";
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const allCategoryLabel = isUrdu ? 'تمام سامان' : 'All items';
  const [category, setCategory] = useState(allCategoryLabel);
  const panel = useRef<HTMLDivElement>(null);
  const results = useRef<HTMLDivElement>(null);

  const found = (item: typeof items[number]) => ingredients.find(i => [item.name, item.english, item.aliases].some(n => norm(n) === norm(i.name) || norm(n) === norm(urdu(i.name))));
  const filtered = items.filter(i => (category === allCategoryLabel || category === 'تمام سامان' || category === 'All items' || category === i.category) && norm(search).split(/\s+/).every(s => norm(i.name + ' ' + i.english + ' ' + i.aliases).includes(s)));

  useEffect(() => {
    if (results.current) results.current.scrollTop = 0;
  }, [search, category, open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
      prev?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="catalog-open"
        onClick={() => {
          setSearch('');
          setCategory(allCategoryLabel);
          setOpen(true);
        }}
      >
        {isUrdu ? "تیار فہرست سے سامان چنیں" : "Choose from catalog"}
      </button>
      <p className="ingredient-form-tip">
        {isUrdu ? "سامان چنیں۔ نام اور کلو، لیٹر یا عدد خود آ جائیں گے۔" : "Select an ingredient. Name and base unit will be set automatically."}
      </p>
      <Form
        key={value.id || value.name || 'new'}
        fields={fields}
        initial={{ low: '0', ...value }}
        submit={submit}
        label={isUrdu ? "سامان محفوظ کریں" : "Save Ingredient"}
      />
      {value.id && (
        <button
          type="button"
          className="danger-btn wide"
          style={{ marginTop: "14px" }}
          onClick={async () => {
            const msg = isUrdu
              ? `کیا آپ واقعی "${value.name}" ڈیلیٹ کرنا چاہتے ہیں؟`
              : `Are you sure you want to delete "${value.name}"?`;
            if (window.confirm(msg)) {
              await submit({ id: value.id, _delete: true });
            }
          }}
        >
          🗑️ {isUrdu ? "سامان ڈیلیٹ کریں" : "Delete Ingredient"}
        </button>
      )}
      {open &&
        createPortal(
          <div className="catalog-backdrop">
            <div
              className="catalog-dialog ingredient-catalog"
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-label={isUrdu ? "سامان کی تیار فہرست" : "Ingredient Catalog"}
              dir={languageDirection()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setOpen(false);
                }
                if (e.key === 'Tab') {
                  const nodes = [...panel.current!.querySelectorAll<HTMLElement>('button:not(:disabled),input')];
                  const first = nodes[0],
                    last = nodes[nodes.length - 1];
                  if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                  }
                  if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                  }
                }
              }}
            >
              <header>
                <div>
                  <h2>{isUrdu ? "سامان کی تیار فہرست" : "Ingredient Catalog"}</h2>
                  <p>{isUrdu ? "جو سامان چاہیے، اس کے آگے «منتخب کریں» دبائیں۔" : "Choose any item to automatically fill in details."}</p>
                </div>
                <button
                  type="button"
                  className="catalog-close"
                  aria-label="Close ingredient catalog"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </header>
              <div className="catalog-filters">
                <label className="catalog-search">
                  <span>{isUrdu ? "سامان تلاش کریں" : "Search ingredients"}</span>
                  <UrduInput
                    aria-label="Search ingredients"
                    autoFocus
                    value={search}
                    placeholder={isUrdu ? "مثلاً پیاز، چاول یا Chicken" : "e.g. Onion, Rice or Chicken"}
                    onChange={(e: any) => setSearch(e.target.value)}
                  />
                </label>
                <div className="catalog-categories">
                  {[allCategoryLabel, ...new Set(items.map((i) => i.category))].map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={c === category ? 'active' : ''}
                      onClick={() => setCategory(c)}
                    >
                      {c === 'تمام سامان' && !isUrdu ? 'All items' : c}
                    </button>
                  ))}
                </div>
                <p className="catalog-guidance">
                  {isUrdu
                    ? "فہرست سے چننے پر اسٹاک یا قیمت نہیں بڑھے گی۔ خریداری کے وقت مقدار اور قیمت لکھیں۔"
                    : "Picking from catalog will not change stock or cost. Record quantities during purchase."}
                </p>
              </div>
              <div className="catalog-results" ref={results}>
                {filtered.map((item) => {
                  const saved = found(item);
                  return (
                    <article key={item.id}>
                      <div className="catalog-dish-details">
                        <strong>{isUrdu ? item.name : item.english || item.name}</strong>
                        <small dir="ltr">{item.english}</small>
                        <span>
                          {item.category} · {item.unit}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setValue(
                            saved
                              ? { ...saved, low: saved.low / 1000 }
                              : { name: isUrdu ? item.name : item.english || item.name, unit: item.unit, low: '0' }
                          );
                          setOpen(false);
                        }}
                      >
                        {saved
                          ? isUrdu
                            ? 'پہلے سے موجود — کھولیں'
                            : 'Already added — Open'
                          : isUrdu
                          ? 'منتخب کریں'
                          : 'Select'}
                      </button>
                    </article>
                  );
                })}
                {!filtered.length && (
                  <p className="catalog-empty">
                    {isUrdu
                      ? "یہ سامان نہیں ملا۔ کھڑکی بند کر کے نام خود لکھ دیں۔"
                      : "No matching items found. Close dialog to type custom name."}
                  </p>
                )}
              </div>
              <footer>
                <span>
                  {filtered.length} {isUrdu ? "چیزیں" : "items"}
                </span>
                <button type="button" className="dialog-close-button" onClick={() => setOpen(false)}>
                  {isUrdu ? "بند کریں" : "Close"}
                </button>
              </footer>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
