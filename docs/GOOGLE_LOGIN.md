# Login com Google

## O que foi implementado no repositorio

- Botao "Continuar com Google" nas telas de entrar e criar conta.
- Supabase OAuth com PKCE; o codigo de retorno e trocado por uma sessao pelo SDK oficial.
- Validacao da sessao pelo backend em `/auth/me`, renovacao do token e logout do Supabase.
- Criacao do perfil no backend usando o ID autenticado. Perfis existentes nao sao sobrescritos.
- Acesso continua condicionado a assinatura paga: sem acesso, `/Subscription`; com acesso, `/Dashboard`.
- Login com email e senha continua disponivel. Nao ha migracao SQL nova para este login.

## O que configurar no navegador

1. No [Supabase](https://supabase.com/dashboard), abra o mesmo projeto usado pelo backend. Entre em **Authentication > Sign In / Providers > Google** e copie a **Callback URL**, no formato `https://<project-ref>.supabase.co/auth/v1/callback`.
2. Abra o [Google Auth Platform](https://console.cloud.google.com/auth/overview). Selecione/crie o projeto e configure **Branding** (nome SlatFit, email de suporte e contato) e **Audience**. Para contas pessoais, use **External**. Enquanto o app estiver em **Testing**, inclua os emails dos socios em **Test users**.
3. Em **Clients > Create client**, escolha **Web application**. Em **Authorized JavaScript origins**, adicione `https://slatfit.onrender.com`. Em **Authorized redirect URIs**, cole a Callback URL do Supabase copiada no passo 1. Crie o cliente e guarde o **Client ID** e o **Client Secret**.
4. Volte ao provedor Google no Supabase, ative-o, preencha **Client ID** e **Client Secret** e salve. O Client Secret fica somente no Supabase; nao deve entrar no frontend, GitHub ou em variaveis `VITE_`.
5. No Supabase, em **Authentication > URL Configuration**, defina **Site URL** como `https://slatfit.onrender.com`. Em **Redirect URLs**, adicione exatamente `https://slatfit.onrender.com/?auth_callback=google`. Esse e o retorno do Supabase ao app, diferente do retorno do Google ao Supabase no passo 3.
6. No Supabase, obtenha a **Project URL** em **Project Settings > Data API** (ou no dialogo **Connect**) e a chave publica em **Project Settings > API Keys**. No Render, abra o servico do **frontend > Environment** e adicione:

   ```text
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   A chave `anon` legada tambem pode ser usada nessa variavel. Nunca use `service_role` ou `sb_secret_...`. Mantenha `VITE_API_BASE_URL=https://slatfit-be-upsu.onrender.com`. As chaves precisam pertencer ao mesmo projeto de `SUPABASE_URL` no backend.
7. Salve e refaca o build/deploy do frontend: variaveis `VITE_` sao incorporadas durante o build. Publique tambem o backend alterado. Nao ha nova variavel obrigatoria no backend para Google.
8. No Render frontend, confirme a regra de SPA: **Redirects/Rewrites**, Source `/*`, Destination `/index.html`, Action **Rewrite**. Ela permite abrir diretamente `/Subscription` e `/Dashboard`.
9. Abra uma janela anonima, entre por Google e confirme o email escolhido. Conta nova/sem assinatura deve abrir `/Subscription`; conta com assinatura paga confirmada deve abrir `/Dashboard`. Teste cancelar no Google, sair da conta e entrar novamente por email/senha.

Para desenvolvimento local, adicione tambem `http://localhost:5173` nas origens do Google e `http://localhost:5173/?auth_callback=google` nas Redirect URLs do Supabase. Use os valores publicos no `.env` local. O retorno e calculado a partir do dominio atual; nao fica preso ao localhost.

## Contas existentes

O Supabase pode vincular automaticamente identidades com o mesmo email verificado. Confirme em **Authentication > Users** que o ID permanece igual ao da conta paga. A assinatura esta ligada ao ID Supabase, nao a um email enviado pelo frontend. Nao crie nem altere linhas de assinatura para liberar o login Google.

## Conferencia

- Frontend: `npm test` e `npm run build`.
- Backend: `npm run build` e `node --import tsx --test test/auth.test.ts`.
- Teste real depende de habilitar o provedor e concluir a autorizacao no Google. Os testes automatizados simulam o provedor, sem usar contas reais.

Referencias: [Google no Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [URLs de retorno](https://supabase.com/docs/guides/auth/redirect-urls), [vinculacao de identidades](https://supabase.com/docs/guides/auth/auth-identity-linking), [rewrite no Render](https://render.com/docs/redirects-rewrites).

O icone `public/google-g.png` e o recurso oficial do [Google](https://developers.google.com/identity/branding-guidelines), servido localmente.
