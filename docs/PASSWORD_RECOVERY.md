# Recuperacao de senha

O link **Esqueci minha senha** abre `/RecuperarSenha`. O Supabase envia o email e o link retorna para `/RedefinirSenha`. A nova senha so e aceita depois de validar uma sessao de recuperacao com PKCE. A sessao e separada do login Google e nao libera o dashboard nem altera assinaturas.

## Configurar no Supabase

1. Em **Authentication > URL Configuration > Redirect URLs**, adicione `https://slatfit.onrender.com/RedefinirSenha`. Para desenvolvimento local, adicione tambem `http://localhost:5173/RedefinirSenha` com a porta efetivamente usada.
2. Mantenha **Site URL** como `https://slatfit.onrender.com` e preserve a URL de retorno do Google ja cadastrada.
3. Em **Authentication > Email Templates > Reset Password**:
   - **Subject:** `Redefinir sua senha — SlatFit`
   - **Body:** copie o HTML de [`docs/email-templates/reset-password.html`](./email-templates/reset-password.html) (mantenha `{{ .ConfirmationURL }}`; nao troque por uma URL direta do frontend).
   - Salve. O proximo email de recuperacao ja sai em portugues (o template padrao do Supabase e em ingles).
4. Configure um provedor **SMTP** no Supabase para enviar emails aos clientes. O envio padrao e limitado e, sem SMTP proprio, pode ficar restrito aos emails da equipe do projeto.
5. No Render frontend, mantenha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` do mesmo projeto usado pelo backend. `VITE_SUPABASE_URL` deve ser so a raiz do projeto (`https://xxxx.supabase.co`), sem `/rest/v1` — Auth usa `/auth/v1`, nao PostgREST. Depois de alterar a env, faca um novo deploy (Vite embute a URL no build). Nao ha nova chave de backend nem migracao SQL.
6. Publique o frontend atualizado e mantenha o rewrite `/*` para `/index.html`.

## Validar com uma conta de teste

- Solicite o email por **Esqueci minha senha** e abra o link no mesmo navegador em que fez a solicitacao. O PKCE exige o verificador salvo nesse navegador; uma janela anonima diferente ou outro dispositivo nao compartilha esse verificador.
- Defina e confirme uma senha com pelo menos oito caracteres. O Supabase ainda aplica sua politica de forca de senha.
- Entre com a nova senha. A conta deve manter o mesmo ID, historico, XP e assinatura; nao e criado outro usuario.
- Confira que a senha anterior nao autentica, que um link expirado mostra erro e que um email sem conta recebe a mesma mensagem generica na interface.
- Confira que um usuario sem assinatura permanece bloqueado em `/Subscription` depois do login.

Os testes automatizados simulam o Supabase e nao enviam emails reais. Os limites de envio sao aplicados pelo Supabase; o botao tambem aguarda 60 segundos para permitir reenvio.

Referencias: [recuperacao e senhas](https://supabase.com/docs/guides/auth/passwords), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [templates de email](https://supabase.com/docs/guides/auth/auth-email-templates).
