'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
export default function AuthGuard({ children }: { children: React.ReactNode }){
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);
  if (loading) return <div className="p-6">Loading…</div>;
  if (!session) return (<div className="max-w-md mx-auto p-6 space-y-4"><h1 className="text-2xl font-bold">Log in</h1><LoginForm/><p className="text-sm text-gray-600">Enter your email and a password or use magic link.</p></div>);
  return <>{children}</>;
}
function LoginForm(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string| null>(null);
  const [msg, setMsg] = useState<string| null>(null);
  const signIn = async () => {
    setError(null); setMsg(null);
    if (password){
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
      if (error) setError(error.message); else setMsg('Check your email for the magic link.');
    }
  };
  const signUp = async () => {
    setError(null); setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message); else setMsg('Account created. You can now log in.');
  };
  return (<div className="space-y-3">
    <input className="w-full border rounded-xl p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
    <input className="w-full border rounded-xl p-2" placeholder="Password (optional)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
    <div className="flex gap-2"><button className="px-3 py-1.5 rounded-xl bg-gray-900 text-white" onClick={signIn}>Log in</button><button className="px-3 py-1.5 rounded-xl border" onClick={signUp}>Sign up</button></div>
    {error && <div className="text-sm text-red-600">{error}</div>}{msg && <div className="text-sm text-green-600">{msg}</div>}
  </div>);
}
