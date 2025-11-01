'use client';
import AuthGuard from '../../components/AuthGuard';
import { supabase } from '../../lib/supabaseClient';
import { useEffect, useMemo, useState } from 'react';
import { Filters, FiltersState, applyFilters } from '../../components/Filters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
export default function Page(){ return <AuthGuard><Comparison/></AuthGuard>; }
function Comparison(){
  const [rows, setRows] = useState<any[]>([]);
  const [fA, _setFA] = useState<FiltersState>({ text:'', categories:[], methods:[], min:'', max:'', from:null, to:null });
  const setFA = (u: Partial<FiltersState>) => _setFA(prev => ({ ...prev, ...u }));
  const [fB, _setFB] = useState<FiltersState>({ text:'', categories:[], methods:[], min:'', max:'', from:null, to:null });
  const setFB = (u: Partial<FiltersState>) => _setFB(prev => ({ ...prev, ...u }));
  useEffect(()=>{ (async ()=>{ const { data } = await supabase.from('transactions').select('*').order('date', { ascending: true }); setRows(data || []); })(); },[]);
  const incomeA = useMemo(()=> applyFilters(rows.filter(r=> r.type==='income'), fA), [rows, fA]);
  const expenseA = useMemo(()=> applyFilters(rows.filter(r=> r.type==='expense'), fA), [rows, fA]);
  const incomeB = useMemo(()=> applyFilters(rows.filter(r=> r.type==='income'), fB), [rows, fB]);
  const expenseB = useMemo(()=> applyFilters(rows.filter(r=> r.type==='expense'), fB), [rows, fB]);
  const sum = (xs:any[])=> xs.reduce((a,b)=> a + Number(b.amount||0), 0);
  const totalIncomeA = sum(incomeA), totalExpenseA = sum(expenseA), netA = totalIncomeA - totalExpenseA;
  const totalIncomeB = sum(incomeB), totalExpenseB = sum(expenseB), netB = totalIncomeB - totalExpenseB;
  const toCat = (xs:any[]) => { const m = new Map<string, number>(); for (const r of xs) m.set(r.category, (m.get(r.category)||0) + Number(r.amount||0)); return Array.from(m, ([k,v]) => ({ category:k, total:v })); };
  const merge = (a: { category:string; total:number }[], b:{ category:string; total:number }[]) => { const m = new Map<string, any>(); for (const r of a) m.set(r.category, { name: r.category, A: r.total, B: 0 }); for (const r of b){ const f=m.get(r.category); if (f) f.B=r.total; else m.set(r.category,{ name:r.category, A:0, B:r.total}); } return Array.from(m.values()); };
  const catIncome = merge(toCat(incomeA), toCat(incomeB));
  const catExpense = merge(toCat(expenseA), toCat(expenseB));
  return (<div className="space-y-6">
    <h1 className="text-2xl font-bold">Comparison</h1>
    <section className="space-y-2"><div className="text-sm font-semibold">Range A</div>
      <Filters f={fA} setF={setFA} categories={Array.from(new Set(rows.map(r=>r.category).filter(Boolean)))} methods={Array.from(new Set(rows.map(r=>r.method).filter(Boolean)))} /></section>
    <section className="space-y-2"><div className="text-sm font-semibold">Range B</div>
      <Filters f={fB} setF={setFB} categories={Array.from(new Set(rows.map(r=>r.category).filter(Boolean)))} methods={Array.from(new Set(rows.map(r=>r.method).filter(Boolean)))} /></section>
    <div className="grid md:grid-cols-3 gap-4">
      <KPI title="Income A" value={totalIncomeA} /><KPI title="Expenses A" value={totalExpenseA} /><KPI title="Net A" value={netA} />
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      <KPI title="Income B" value={totalIncomeB} /><KPI title="Expenses B" value={totalExpenseB} /><KPI title="Net B" value={netB} />
    </div>
    <section className="space-y-4"><h3 className="text-lg font-semibold">Income by Category</h3>
      <div className="h-72 bg-white rounded-2xl shadow p-3">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={catIncome}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip formatter={(v:any)=>`₱${Number(v).toLocaleString()}`}/><Legend/><Bar dataKey="A" name="Range A"/><Bar dataKey="B" name="Range B"/></BarChart></ResponsiveContainer>
      </div></section>
    <section className="space-y-4"><h3 className="text-lg font-semibold">Expenses by Category</h3>
      <div className="h-72 bg-white rounded-2xl shadow p-3">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={catExpense}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip formatter={(v:any)=>`₱${Number(v).toLocaleString()}`}/><Legend/><Bar dataKey="A" name="Range A"/><Bar dataKey="B" name="Range B"/></BarChart></ResponsiveContainer>
      </div></section>
  </div>);
}
function KPI({ title, value }: { title: string; value: number }){ return (<div className="bg-white rounded-2xl shadow p-4"><div className="text-sm text-gray-500">{title}</div><div className="text-2xl font-bold">₱{Number(value).toLocaleString()}</div></div>); }
