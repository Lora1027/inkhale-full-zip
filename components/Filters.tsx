'use client';
import { useMemo } from 'react';
export type FiltersState = {
  text: string; categories: string[]; methods: string[];
  min?: number | ''; max?: number | ''; from?: string | null; to?: string | null;
};
export function applyFilters<T extends { category?: string | null; method?: string | null; note?: string | null; amount?: number; date?: string }>(items: T[], f: FiltersState){
  return items.filter(t => {
    if (f.categories.length && !f.categories.includes(t.category || '')) return false;
    if (f.methods.length && !f.methods.includes(t.method || '')) return false;
    if (f.min !== '' && f.min != null && (t.amount ?? 0) < Number(f.min)) return false;
    if (f.max !== '' && f.max != null && (t.amount ?? 0) > Number(f.max)) return false;
    if (f.from && t.date && new Date(t.date) < new Date(f.from)) return false;
    if (f.to && t.date && new Date(t.date) > new Date(f.to)) return false;
    if (f.text){
      const q = f.text.toLowerCase();
      const hay = `${t.category ?? ''} ${t.method ?? ''} ${t.note ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
export function Filters({ f, setF, categories, methods }: { f: FiltersState; setF: (u: Partial<FiltersState>) => void; categories: string[]; methods: string[]; }){
  const cats = useMemo(() => Array.from(new Set(categories)).sort(), [categories]);
  const meths = useMemo(() => Array.from(new Set(methods)).sort(), [methods]);
  return (<div className="grid gap-3 md:grid-cols-12 p-3 md:p-4 bg-white/70 backdrop-blur rounded-2xl shadow">
    <div className="md:col-span-3"><label className="block text-sm font-semibold mb-1">Search</label><input className="w-full rounded-xl border p-2" placeholder="Find note, category, method…" value={f.text} onChange={e=>setF({ text: e.target.value })} /></div>
    <div className="md:col-span-3"><label className="block text-sm font-semibold mb-1">Categories</label><select multiple className="w-full rounded-xl border p-2" value={f.categories} onChange={e=> setF({ categories: Array.from(e.target.selectedOptions).map(o=>o.value) }) }>{cats.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
    <div className="md:col-span-3"><label className="block text-sm font-semibold mb-1">Methods</label><select multiple className="w-full rounded-xl border p-2" value={f.methods} onChange={e=> setF({ methods: Array.from(e.target.selectedOptions).map(o=>o.value) }) }>{meths.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
    <div className="md:col-span-1"><label className="block text-sm font-semibold mb-1">Min ₱</label><input type="number" className="w-full rounded-xl border p-2" value={f.min as any ?? ''} onChange={e=> setF({ min: e.target.value === '' ? '' : Number(e.target.value) }) } /></div>
    <div className="md:col-span-1"><label className="block text-sm font-semibold mb-1">Max ₱</label><input type="number" className="w-full rounded-xl border p-2" value={f.max as any ?? ''} onChange={e=> setF({ max: e.target.value === '' ? '' : Number(e.target.value) }) } /></div>
    <div className="md:col-span-1"><label className="block text-sm font-semibold mb-1">From</label><input type="date" className="w-full rounded-xl border p-2" value={f.from ?? ''} onChange={e=> setF({ from: e.target.value || null }) } /></div>
    <div className="md:col-span-1"><label className="block text-sm font-semibold mb-1">To</label><input type="date" className="w-full rounded-xl border p-2" value={f.to ?? ''} onChange={e=> setF({ to: e.target.value || null }) } /></div>
    <div className="md:col-span-12"><button className="rounded-full border px-3 py-1 text-sm" onClick={()=> setF({ text:'', categories:[], methods:[], min:'', max:'', from:null, to:null }) }>Clear</button></div>
  </div>);
}
