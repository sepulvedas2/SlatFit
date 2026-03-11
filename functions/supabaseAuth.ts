import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

Deno.serve(async (req) => {
  try {
    const { action, email, password, full_name } = await req.json();

    if (action === 'login') {
      const client = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
        },
        token: data.session.access_token,
      });
    }

    if (action === 'register') {
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);

      // Verificar se email já existe na tabela profiles
      const { data: existingProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingProfile) {
        return Response.json({ error: 'Esse email já foi registrado.' }, { status: 400 });
      }

      // Criar usuário no Supabase Auth
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });
      if (error) return Response.json({ error: error.message }, { status: 400 });

      // Criar perfil na tabela profiles
      const { error: profileError } = await adminClient
        .from('profiles')
        .insert([{ id: data.user.id, email: email, plan: 'free' }]);

      if (profileError) {
        // Rollback: remover usuário criado se perfil falhou
        await adminClient.auth.admin.deleteUser(data.user.id);
        return Response.json({ error: 'Erro ao criar perfil: ' + profileError.message }, { status: 400 });
      }

      // Fazer login automaticamente
      const anonClient = createClient(supabaseUrl, supabaseAnonKey);
      const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({ email, password });
      if (loginError) return Response.json({ error: loginError.message }, { status: 400 });

      return Response.json({
        user: {
          id: loginData.user.id,
          email: loginData.user.email,
          full_name: loginData.user.user_metadata?.full_name || full_name,
        },
        token: loginData.session.access_token,
      });
    }

    return Response.json({ error: 'Action not found' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});