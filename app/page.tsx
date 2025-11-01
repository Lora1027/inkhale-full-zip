'use client';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
export default function Page(){ return (<AuthGuard><Dashboard/></AuthGuard>); }
function Dashboard(){
  const [me, setMe] = useState<any>(null);
  useEffect(()=>{ supabase.auth.getUser().then(({ data })=> setMe(data.user)); },[]);
  return (<div className="space-y-4"><div className="bg-white rounded-2xl shadow p-4"><div className="text-sm text-gray-500">Logged in as</div><div className="text-xl font-bold">{me?.email}</div></div></div>);
}
