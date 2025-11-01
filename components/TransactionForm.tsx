'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) {
    alert('Not logged in');
    return;
  }

  const payload = { ...form, amount: Number(form.amount), user_id: uid };

  let error;
  if (initial?.id) {
    ({ error } = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', initial.id));
  } else {
    ({ error } = await supabase.from('transactions').insert(payload as any));
  }

  if (error) {
    console.error(error);
    alert('Save failed: ' + error.message);
    return;
  }

  onSaved();
  onClose();
};
