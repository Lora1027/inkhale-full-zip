'use client';
import AuthGuard from '../../components/AuthGuard';
import { supabase } from '../../lib/supabaseClient';
import { useEffect, useState } from 'react';
export default function Page(){ return <AuthGuard><Methods/></AuthGuard>; }
function Methods(){
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState(''); const [note, setNote] = useState('');
  const load = async () => { const { data } = await supabase.from('payment_methods').select('*').order('created_at', { ascending: true }); setRows(data || []); };
  useEffect(()=>{ load(); },[]);
  const add = async () => { await supabase.from('payment_methods').insert({ name, note }); setName(''); setNote(''); load(); };
  return (<div className="space-y-4">
    <h1 className="text-2xl font-bold">Methods of Payment</h1>
    <div className="bg-white rounded-2xl shadow p-4 space-y-3">
      <input className="border rounded-xl p-2 w-full" placeholder="Method name (Cash, Card, GCash…)" value={name} onChange={e=>setName(e.target.value)} />
      <input className="border rounded-xl p-2 w-full" placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} />
      <button className="px-3 py-1.5 rounded-xl bg-gray-900 text-white" onClick={add}>Add</button>
    </div>
    <div className="overflow-x-auto rounded-2xl shadow bg-white">
      <table className="min-w-full"><thead className="text-left text-sm text-gray-500"><tr><th className="p-3">Name</th><th className="p-3">Note</th></tr></thead>
      <tbody>{rows?.map(r => <tr key={r.id} className="border-t text-sm"><td className="p-3">{r.name}</td><td className="p-3">{r.note}</td></tr>)}
      {(!rows || rows.length===0) && <tr><td className="p-6 text-center text-sm text-gray-500" colSpan={2}>No methods.</td></tr>}</tbody></table>
    </div></div>);
}
