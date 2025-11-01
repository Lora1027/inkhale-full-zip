'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type Tx = { id?: string; date: string; type: 'income'|'expense'; category: string; method?: string|null; note?: string|null; amount: number };

export default function TransactionForm({ open, onClose, initial, onSaved }:{ open:boolean; onClose:()=>void; initial?: Partial<Tx>|null; onSaved:()=>void; }){
  const [form, setForm] = useState<Tx>({ date: new Date().toISOString().slice(0,10), type: 'expense', category: '', method: '', note: '', amount: 0 });
  useEffect(()=>{
    if (initial){
      setForm((prev)=> ({ ...prev, ...initial, date: (initial.date as any)?.slice?.(0,10) || prev.date }) as Tx);
    }
  }, [initial]);

  if (!open) return null;
  const save = async () => {
    const payload = { ...form, amount: Number(form.amount) };
    if (initial?.id){
      await supabase.from('transactions').update(payload).eq('id', initial.id);
    } else {
      await supabase.from('transactions').insert(payload as any);
    }
    onSaved(); onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">{initial?.id ? 'Edit' : 'Add'} Transaction</h3>
        <div className="grid gap-2">
          <input type="date" className="border rounded-xl p-2" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
          <select className="border rounded-xl p-2" value={form.type} onChange={e=> setForm({...form, type: e.target.value as any})}>
            <option value="income">Income</option><option value="expense">Expense</option>
          </select>
          <input className="border rounded-xl p-2" placeholder="Category" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}/>
          <input className="border rounded-xl p-2" placeholder="Method (Cash, Card…)" value={form.method || ''} onChange={e=>setForm({...form, method:e.target.value})}/>
          <input className="border rounded-xl p-2" placeholder="Note" value={form.note || ''} onChange={e=>setForm({...form, note:e.target.value})}/>
          <input type="number" className="border rounded-xl p-2" placeholder="Amount" value={form.amount} onChange={e=>setForm({...form, amount:Number(e.target.value)})}/>
        </div>
        <div className="flex gap-2 mt-3 justify-end">
          <button className="px-3 py-1.5 rounded-xl border" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1.5 rounded-xl bg-gray-900 text-white" onClick={save}>{initial?.id ? 'Save' : 'Add'}</button>
        </div>
      </div>
    </div>
  );
}
