'use client';
import AuthGuard from '../../components/AuthGuard';
import { supabase } from '../../lib/supabaseClient';
import Papa from 'papaparse';
import { useEffect, useMemo, useState } from 'react';
import { Filters, FiltersState, applyFilters } from '../../components/Filters';
export default function Page(){ return <AuthGuard><Inventory/></AuthGuard>; }
function Inventory(){
  const [rows, setRows] = useState<any[]>([]);
  const [f, _setF] = useState<FiltersState>({ text:'', categories:[], methods:[], min:'', max:'', from:null, to:null });
  const setF = (u: Partial<FiltersState>) => _setF(prev => ({ ...prev, ...u }));
  const load = async () => { const { data } = await supabase.from('inventory').select('*').order('created_at', { ascending: true }); setRows(data || []); };
  useEffect(()=>{ load(); },[]);
  const categories = useMemo(()=> Array.from(new Set(rows.map(r=> r.category).filter(Boolean))), [rows]);
  const methods: string[] = [];
  const filtered = useMemo(()=> applyFilters(rows.map(r => ({ ...r, method: '', date: r.created_at, amount: Number(r.price) })), f), [rows, f]);
  const onCSV = async (file: File) => {
    Papa.parse(file, { header: true, skipEmptyLines: true, complete: async (result) => {
      const items = (result.data as any[]).map(r => ({ sku: String(r.sku || '').trim(), name: String(r.name || '').trim(), category: r.category ? String(r.category).trim() : null, cost: r.cost ? Number(r.cost) : null, price: r.price ? Number(r.price) : null, qty: r.qty ? Number(r.qty) : 0 })).filter(i => i.sku && i.name);
      if (items.length) await supabase.from('inventory').insert(items); load();
    }});
  };
  return (<div className="space-y-4">
    <h1 className="text-2xl font-bold">Inventory</h1>
    <div className="bg-white rounded-2xl shadow p-4 space-y-3">
      <div><div className="text-sm font-semibold">Bulk upload (CSV)</div><p className="text-sm text-gray-600 mb-2">Columns: <code>sku,name,category,cost,price,qty</code></p><input type="file" accept=".csv" onChange={e=> e.target.files && onCSV(e.target.files[0]) } /></div>
    </div>
    <Filters f={f} setF={setF} categories={categories} methods={methods} />
    <div className="overflow-x-auto rounded-2xl shadow bg-white">
      <table className="min-w-full"><thead className="text-left text-sm text-gray-500"><tr><th className="p-3">SKU</th><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Cost</th><th className="p-3">Price</th><th className="p-3">Qty</th></tr></thead>
      <tbody>{filtered.map(r => (<tr key={r.id} className="border-t text-sm"><td className="p-3">{r.sku}</td><td className="p-3">{r.name}</td><td className="p-3">{r.category}</td><td className="p-3">{r.cost ?? ''}</td><td className="p-3">{r.price ?? ''}</td><td className="p-3">{r.qty}</td></tr>))}
      {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-sm text-gray-500">No results.</td></tr>}</tbody></table>
    </div>
  </div>);
}
