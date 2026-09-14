import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Mail } from 'lucide-react';
import { requestPasswordReset, updateRecoveredPassword, validateRecoveryLink } from '@/lib/password-recovery';

const inputClass = 'w-full h-11 rounded-lg border border-gray-300 bg-white px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-60';
const buttonClass = 'flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#E3EF26] px-4 py-3 text-sm font-semibold text-[#080626] hover:bg-[#d6e21c] disabled:cursor-not-allowed disabled:opacity-60';

function PasswordField({ id, label, value, onChange, disabled }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-800">{label}</label>
      <div className="relative">
        <input id={id} name={id} type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8}
          value={value} onChange={onChange} disabled={disabled} className={`${inputClass} pr-12`} />
        <button type="button" onClick={() => setVisible(!visible)} title={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`} aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-600">
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function PasswordRecovery({ mode }) {
  const location = useLocation();
  const isReset = mode === 'reset';
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState(isReset ? 'validating' : 'idle');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const busy = status === 'submitting';

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${isReset ? 'Redefinir' : 'Recuperar'} senha | SlatFit`;
    let active = true;
    if (isReset) {
      validateRecoveryLink().then(() => { if (active) setStatus('ready'); }).catch((err) => {
        if (active) { setStatus('invalid'); setError(err.message); }
      });
    }
    return () => { active = false; document.title = previousTitle; };
  }, [isReset]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy || (!isReset && cooldown > 0)) return;
    setError('');
    if (isReset && password !== confirmation) { setError('As senhas não coincidem.'); return; }
    setStatus('submitting');
    try {
      if (isReset) {
        await updateRecoveredPassword(password);
        setPassword('');
        setConfirmation('');
        setStatus('complete');
      } else {
        await requestPasswordReset(email);
        setCooldown(60);
        setStatus('sent');
      }
    } catch (err) {
      setError(err.message || 'Não foi possível concluir. Tente novamente.');
      setStatus(isReset ? 'ready' : 'idle');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F1C1B] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white px-5 py-9 shadow-xl sm:px-8">
        <Link to="/" className="mb-8 block text-center text-3xl font-extrabold text-gray-950">SlatFit</Link>
        <h1 className="text-2xl font-bold text-gray-900">{isReset ? 'Definir nova senha' : 'Recuperar senha'}</h1>
        {status === 'validating' && (
          <div role="status" className="mt-6 flex items-center gap-3 text-sm text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" /> Verificando link...
          </div>
        )}
        {error && <p role="alert" className="mt-5 break-words rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {status === 'invalid' && <Link to="/RecuperarSenha" className={`${buttonClass} mt-6`}><Mail className="h-4 w-4" /> Solicitar novo link</Link>}
        {status === 'complete' && (
          <div role="status" className="mt-6 space-y-4">
            <p className="flex items-center gap-2 text-sm text-green-800"><CheckCircle2 className="h-5 w-5 shrink-0" /> Sua senha foi atualizada.</p>
            <Link to="/" className={buttonClass}>Voltar ao SlatFit</Link>
          </div>
        )}
        {(!isReset || ['ready', 'submitting'].includes(status)) && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {isReset ? (
              <>
                <PasswordField id="new-password" label="Nova senha" value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} />
                <p className="text-xs text-gray-600">Pelo menos 8 caracteres.</p>
                <PasswordField id="confirm-password" label="Confirmar nova senha" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} disabled={busy} />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="recovery-email" className="text-sm font-medium text-gray-800">Email da conta</label>
                  <input id="recovery-email" name="email" type="email" autoComplete="email" required value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus('idle'); setError(''); }} disabled={busy} className={inputClass} />
                </div>
                {status === 'sent' && (
                  <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                    Se houver uma conta com esse email, você receberá um link. Confira também o spam e abra o link neste mesmo navegador.
                  </p>
                )}
              </>
            )}
            <button type="submit" disabled={busy || (!isReset && cooldown > 0)} className={buttonClass}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isReset ? <KeyRound className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              {busy ? 'Aguarde...' : isReset ? 'Salvar nova senha' : cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Enviar link de recuperação'}
            </button>
            {isReset && <Link to="/RecuperarSenha" className="block text-center text-sm text-[#0B3936] underline underline-offset-4">Solicitar outro link</Link>}
          </form>
        )}
        <Link to="/" className="mt-7 flex items-center justify-center gap-2 text-sm font-medium text-[#0B3936] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar para entrar
        </Link>
      </div>
    </main>
  );
}
