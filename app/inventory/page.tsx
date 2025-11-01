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
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return alert('Not logged in');

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (result) => {
      const items = (result.data as any[]).map(r => ({
        user_id: uid,                       // ← add this
        sku: String(r.sku || '').trim(),
        name: String(r.name || '').trim(),
        category: r.category ? String(r.category).trim() : null,
        cost: r.cost ? Number(r.cost) : null,
        price: r.price ? Number(r.price) : null,
        qty: r.qty ? Number(r.qty) : 0
      })).filter(i => i.sku && i.name);
      const { error } = await supabase.from('inventory').insert(items);
      if (error) { alert('Upload failed: ' + error.message); return; }
      load();
    }
  });
};
