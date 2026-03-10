import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { saveUser } from "@/components/auth";
import { Loader2, Eye, EyeOff, Dumbbell } from "lucide-react";

export default function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = tab === 'login'
        ? { action: 'login', email, password }
        : { action: 'register', email, password, full_name: name };

      const resp = await base44.functions.invoke('supabaseAuth', payload);
      if (resp.data?.error) throw new Error(resp.data.error);

      saveUser(resp.data.user, resp.data.token);
      onLogin(resp.data.user);
    } catch (err) {
      setError(err.message || 'Erro ao autenticar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#0F1C1B" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        .login-input::placeholder { color: rgba(160,181,178,0.5); }
        .login-input:focus { outline: none; box-shadow: 0 0 0 2px rgba(206,241,123,0.3); }
      `}</style>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl" style={{ background: "linear-gradient(135deg, #CEF17B, #84cc16)" }}>
            <Dumbbell className="w-10 h-10 text-[#084734]" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>SlatFit</h1>
          <p className="text-[#A0B5B2] text-sm mt-2">Seu app de fitness inteligente 💪</p>
        </div>

        <div className="rounded-3xl p-6" style={{ backgroundColor: "rgba(22,42,40,0.95)", border: "1px solid rgba(206,241,123,0.15)", backdropFilter: "blur(20px)" }}>
          <div className="flex rounded-2xl p-1 mb-6" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  backgroundColor: tab === t ? '#CEF17B' : 'transparent',
                  color: tab === t ? '#084734' : '#A0B5B2',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="text-[#A0B5B2] text-xs font-medium mb-1.5 block">Nome completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="login-input w-full px-4 py-3 rounded-xl text-white text-sm"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(206,241,123,0.2)" }}
                />
              </div>
            )}

            <div>
              <label className="text-[#A0B5B2] text-xs font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="login-input w-full px-4 py-3 rounded-xl text-white text-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(206,241,123,0.2)" }}
              />
            </div>

            <div>
              <label className="text-[#A0B5B2] text-xs font-medium mb-1.5 block">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="login-input w-full px-4 py-3 rounded-xl text-white text-sm pr-12"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(206,241,123,0.2)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0B5B2] hover:text-white"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-[#084734] flex items-center justify-center gap-2 transition-all duration-200"
              style={{ backgroundColor: loading ? "rgba(206,241,123,0.5)" : "#CEF17B", marginTop: "8px", fontFamily: 'Inter, sans-serif' }}
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Aguarde...</> : (tab === 'login' ? '→ Entrar' : '→ Criar Conta')}
            </button>
          </form>

          <p className="text-center text-[#A0B5B2] text-xs mt-5">
            {tab === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-[#CEF17B] font-semibold hover:underline"
            >
              {tab === 'login' ? 'Criar agora' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}