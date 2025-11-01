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
  const add = async () => {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return alert('Not logged in');
  const { error } = await supabase.from('payment_methods').insert({ name, note, user_id: uid });
  if (error) { alert('Add failed: ' + error.message); return; }
  setName(''); setNote(''); load();
};

