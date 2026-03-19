import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      console.error('[Supabase] Usuário não autenticado');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, table, query, data, bucket, path, fileBase64, mimeType } = await req.json();
    console.log(`[Supabase] ${action.toUpperCase()} em ${table} por ${user.email}`);
    const now = new Date().toISOString();

    const normalizeProfileFilterColumn = (col) => table === 'user_profiles' && col === 'user_email' ? 'email' : col;
    const normalizeOrderColumn = (col) => table === 'user_profiles' && col === 'created_date' ? 'created_at' : col;
    const normalizeProfileData = (item) => {
      if (table !== 'user_profiles' || !item) return item;
      const normalized = { ...item };
      if ('user_email' in normalized) {
        normalized.email = normalized.user_email;
        delete normalized.user_email;
      }
      return normalized;
    };

    const runWithRetry = async (operation, attempts = 3) => {
      let lastResult;
      for (let i = 0; i < attempts; i++) {
        lastResult = await operation();
        const message = String(lastResult?.error?.message || '').toLowerCase();
        const details = String(lastResult?.error?.details || '').toLowerCase();
        const shouldRetry = message.includes('connection reset') || details.includes('connection reset');
        if (!lastResult?.error || !shouldRetry || i === attempts - 1) {
          return lastResult;
        }
      }
      return lastResult;
    };

    // ── DATABASE ──────────────────────────────────────────────────────────────
    if (action === 'select') {
      let q = supabase.from(table).select(query?.select || '*');
      if (query?.filter) {
        for (const [col, val] of Object.entries(query.filter)) {
          const normalizedCol = normalizeProfileFilterColumn(col);
          if (val === null) q = q.is(normalizedCol, null);
          else q = q.eq(normalizedCol, val);
        }
      }
      if (query?.order) q = q.order(normalizeOrderColumn(query.order.column), { ascending: query.order.ascending ?? false });
      if (query?.limit) q = q.limit(query.limit);
      const { data: rows, error } = await q;
      if (error) {
        console.error(`[Supabase] SELECT ERROR em ${table}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return Response.json({ 
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        }, { status: 400 });
      }
      const normalizedRows = table === 'user_profiles'
        ? (rows || []).map((row) => ({ ...row, user_email: row.user_email || row.email }))
        : rows;
      console.log(`[Supabase] SELECT retornou ${normalizedRows?.length || 0} registros de ${table}`);
      return Response.json({ data: normalizedRows });
    }

    if (action === 'insert') {
      const addMeta = (item) => normalizeProfileData({
        ...item,
        created_date: item.created_date || now,
        updated_date: now,
        created_by: item.created_by || user.email,
      });
      const dataToInsert = Array.isArray(data) ? data.map(addMeta) : addMeta(data);
      console.log(`[Supabase] Inserindo em ${table}:`, dataToInsert);
      const { data: inserted, error } = await supabase.from(table).insert(dataToInsert).select();
      if (error) {
        console.error(`[Supabase] Erro ao inserir em ${table}:`, error.message);
        return Response.json({ error: error.message }, { status: 400 });
      }
      console.log(`[Supabase] Inserido com sucesso em ${table}:`, inserted);
      return Response.json({ data: inserted });
    }

    if (action === 'update') {
      const dataToUpdate = normalizeProfileData({ ...data, updated_date: now });
      let q = supabase.from(table).update(dataToUpdate);
      if (query?.filter) {
        for (const [col, val] of Object.entries(query.filter)) {
          q = q.eq(normalizeProfileFilterColumn(col), val);
        }
      }
      console.log(`[Supabase] Atualizando ${table} com filtro:`, query?.filter, 'dados:', dataToUpdate);
      const { data: updated, error } = await q.select();
      if (error) {
        console.error(`[Supabase] Erro ao atualizar ${table}:`, error.message);
        return Response.json({ error: error.message }, { status: 400 });
      }
      console.log(`[Supabase] Atualizado com sucesso em ${table}:`, updated);
      return Response.json({ data: updated });
    }

    if (action === 'delete') {
      let q = supabase.from(table).delete();
      if (query?.filter) {
        for (const [col, val] of Object.entries(query.filter)) {
          q = q.eq(col, val);
        }
      }
      const { error } = await q;
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ success: true });
    }

    // ── STORAGE ───────────────────────────────────────────────────────────────
    if (action === 'storage_upload') {
      const bytes = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
      const { data: uploaded, error } = await supabase.storage
        .from(bucket).upload(path, bytes, { contentType: mimeType || 'application/octet-stream', upsert: true });
      if (error) return Response.json({ error: error.message }, { status: 400 });
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      return Response.json({ data: uploaded, publicUrl });
    }

    if (action === 'storage_list') {
      const { data: files, error } = await supabase.storage.from(bucket).list(path || '');
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ data: files });
    }

    if (action === 'storage_delete') {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ success: true });
    }

    if (action === 'storage_url') {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      return Response.json({ publicUrl });
    }

    return Response.json({ error: 'Action not found' }, { status: 400 });
  } catch (error) {
    console.error('[Supabase] Erro fatal:', error.message, error.stack);
    return Response.json({ 
      error: error.message,
      details: error.toString(),
      stack: error.stack 
    }, { status: 500 });
  }
});