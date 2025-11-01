'use client';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useMemo, useState } from 'react';
import { Filters, FiltersState, applyFilters } from '@/components/Filters';
export default function Page(){ return <AuthGuard><Reports/></AuthGuard>; }
function Reports(){
  const [rows, setRows] = useState<any[]>([]);
  const [f, _setF] = useState<FiltersState>({ text:'', categories:[], methods:[], min:'', max:'', from:null, to:null });
  const setF = (u: Partial<FiltersState>) => _setF(prev => ({ ...prev, ...u }));
  useEffect(()=>{ (async ()=>{ const { data } = await supabase.from('transactions').select('*').order('date', { ascending: true }); setRows(data || []); })(); },[]);
  const filtered = useMemo(()=> applyFilters(rows, f), [rows, f]);
  const sum = (type:'income'|'expense') => filtered.filter(r=>r.type===type).reduce((a,b)=> a + Number(b.amount||0), 0);
  const totalIncome = sum('income'), totalExpense = sum('expense'), net = totalIncome - totalExpense;
  const printIt = () => window.print();
  const byCat = (type:'income'|'expense') => {
    const m = new Map<string, number>();
    for (const r of filtered.filter(r=>r.type===type)) m.set(r.category, (m.get(r.category)||0) + Number(r.amount||0));
    return Array.from(m, ([k,v])=>({k,v})).sort((a,b)=> b.v-a.v);
  };
  return (<div className="space-y-4">
    <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Printable Report</h1>
      <button className="no-print px-3 py-1.5 rounded-xl bg-gray-900 text-white" onClick={printIt}>Print</button></div>
    <Filters f={f} setF={setF} categories={Array.from(new Set(rows.map(r=>r.category).filter(Boolean)))} methods={Array.from(new Set(rows.map(r=>r.method).filter(Boolean)))} />
    <section className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Summary</h2>
      <div className="grid md:grid-cols-3 gap-3">
        <div><div className="text-sm text-gray-500">Total Income</div><div className="text-xl font-bold">₱{Number(totalIncome).toLocaleString()}</div></div>
        <div><div className="text-sm text-gray-500">Total Expenses</div><div className="text-xl font-bold">₱{Number(totalExpense).toLocaleString()}</div></div>
        <div><div className="text-sm text-gray-500">Net</div><div className="text-xl font-bold">₱{Number(net).toLocaleString()}</div></div>
      </div>
    </section>
    <section className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Income by Category</h2>
      <table className="min-w-full"><thead className="text-left text-sm text-gray-500"><tr><th className="p-2">Category</th><th className="p-2">Total</th></tr></thead>
        <tbody>{byCat('income').map(r=>(<tr key={r.k} className="border-t text-sm"><td className="p-2">{r.k}</td><td className="p-2">₱{Number(r.v).toLocaleString()}</td></tr>))}
        {byCat('income').length===0 && <tr><td colSpan={2} className="p-4 text-sm text-gray-500">No income.</td></tr>}</tbody></table>
    </section>
    <section className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Expenses by Category</h2>
      <table className="min-w-full"><thead className="text-left text-sm text-gray-500"><tr><th className="p-2">Category</th><th className="p-2">Total</th></tr></thead>
        <tbody>{byCat('expense').map(r=>(<tr key={r.k} className="border-t text-sm"><td className="p-2">{r.k}</td><td className="p-2">₱{Number(r.v).toLocaleString()}</td></tr>))}
        {byCat('expense').length===0 && <tr><td colSpan={2} className="p-4 text-sm text-gray-500">No expenses.</td></tr>}</tbody></table>
    </section>
    <section className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Detailed Transactions</h2>
      <table className="min-w-full"><thead className="text-left text-sm text-gray-500"><tr><th className="p-2">Date</th><th className="p-2">Type</th><th className="p-2">Category</th><th className="p-2">Method</th><th className="p-2">Note</th><th className="p-2">Amount</th></tr></thead>
        <tbody>{filtered.map(r=>(<tr key={r.id} className="border-t text-sm"><td className="p-2">{new Date(r.date).toLocaleDateString()}</td><td className="p-2">{r.type}</td><td className="p-2">{r.category}</td><td className="p-2">{r.method}</td><td className="p-2">{r.note}</td><td className="p-2">₱{Number(r.amount).toLocaleString()}</td></tr>))}
        {filtered.length===0 && <tr><td colSpan={6} className="p-4 text-sm text-gray-500">No transactions in this filter.</td></tr>}</tbody></table>
    </section>
  </div>);
}
