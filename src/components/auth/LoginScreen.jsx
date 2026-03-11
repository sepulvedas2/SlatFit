import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { saveUser } from "@/components/auth";
import { Loader2, Eye, EyeOff, Dumbbell } from "lucide-react";

export default function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <section className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: "#0B3936" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Inter:wght@400;500;600&display=swap');
        .login-input { font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .login-input::placeholder { color: #9ca3af; }
        .login-input:focus { outline: none; border-color: #16a34a !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.15); }
      `}</style>

      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/95 shadow-2xl rounded-2xl px-8 py-10 flex flex-col gap-7">

          {/* Logo */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
              SlatFit
            </h1>
            <p className="text-gray-400 mt-1 text-sm">Transforme seu corpo, transforme sua vida 💪</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 gap-1" style={{ backgroundColor: "#f3f4f6" }}>
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={tab === t
                  ? { backgroundColor: "#CAEE7A", color: "#0B3936", boxShadow: "0 2px 8px rgba(202,238,122,0.4)" }
                  : { backgroundColor: "transparent", color: "#6b7280" }
                }
              >
                {t === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === 'register' && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
                className="login-input w-full px-4 h-11 rounded-lg text-gray-800 text-sm border border-gray-200 bg-white"
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu email"
              required
              className="login-input w-full px-4 h-11 rounded-lg text-gray-800 text-sm border border-gray-200 bg-white"
            />

            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                minLength={6}
                className="login-input w-full px-4 h-11 rounded-lg text-gray-800 text-sm border border-gray-200 bg-white pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={{ backgroundColor: loading ? "rgba(202,238,122,0.5)" : "#CAEE7A", color: "#0B3936", boxShadow: loading ? "none" : "0 4px 14px rgba(202,238,122,0.4)" }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</>
                : (tab === 'login' ? 'Entrar' : 'Criar Conta')
              }
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            {tab === 'login' ? 'Não possui conta?' : 'Já tem conta?'}{' '}
            <button
              onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
              className="font-semibold hover:underline" style={{ color: "#0B3936" }}
            >
              {tab === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>

        </div>
      </div>
    </section>
  );
}