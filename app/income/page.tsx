'use client';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useMemo, useState } from 'react';
import { Filters, FiltersState, applyFilters } from '@/components/Filters';
import TransactionForm from '@/components/TransactionForm';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function Page(){
  return <AuthGuard><IncomePage/></AuthGuard>;
}

function IncomePage(){
  const [rows, setRows] = useState<any[]>([]);
  const [f, _setF] = useState<FiltersState>({ text:'', categories:[], methods:[], min:'', max:'', from:null, to:null });
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any|null>(null);
  const setF = (u: Partial<FiltersState>) => _setF(prev => ({ ...prev, ...u }));

  const load = async()=>{
    const { data } = await supabase.from('transactions').select('*').eq('type','income').order('date', { ascending: true });
    setRows(data || []);
  };
  useEffect(()=>{ load(); },[]);

  const categories = useMemo(()=> Array.from(new Set(rows.map(r=> r.category).filter(Boolean))), [rows]);
  const methods = useMemo(()=> Array.from(new Set(rows.map(r=> r.method).filter(Boolean))), [rows]);
  const filtered = useMemo(()=> applyFilters(rows, f), [rows, f]);

  const remove = async(id:string)=>{ await supabase.from('transactions').delete().eq('id', id); load(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Income</h1>
        <button className="no-print inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 text-white" onClick={()=>{ setEdit(null); setOpen(true); }}><Plus className="w-4 h-4"/>Add</button>
      </div>
      <Filters f={f} setF={setF} categories={categories} methods={methods} />
      <div className="overflow-x-auto rounded-2xl shadow bg-white">
        <table className="min-w-full">
          <thead className="text-left text-sm text-gray-500">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Category</th>
              <th className="p-3">Method</th>
              <th className="p-3">Note</th>
              <th className="p-3">Amount</th>
              <th className="p-3 no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t text-sm">
                <td className="p-3">{new Date(r.date).toLocaleDateString()}</td>
                <td className="p-3">{r.category}</td>
                <td className="p-3">{r.method}</td>
                <td className="p-3">{r.note}</td>
                <td className="p-3 font-semibold">₱{Number(r.amount).toLocaleString()}</td>
                <td className="p-3 no-print">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded-lg border" onClick={()=>{ setEdit(r); setOpen(true); }}><Pencil className="w-4 h-4"/></button>
                    <button className="px-2 py-1 rounded-lg border" onClick={()=>remove(r.id)}><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-sm text-gray-500">No results.</td></tr>}
          </tbody>
        </table>
      </div>

      <TransactionForm open={open} onClose={()=>setOpen(false)} initial={edit} onSaved={load} />
    </div>
  );
}
