import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");

console.log("URL:", supabaseUrl?.substring(0, 30));
console.log("KEY starts with:", supabaseServiceKey?.substring(0, 20));

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, table, query, data, bucket, path, fileBase64, mimeType } = await req.json();

    // ── DATABASE ──────────────────────────────────────────────────────────────
    if (action === 'select') {
      let q = supabase.from(table).select(query?.select || '*');
      if (query?.filter) {
        for (const [col, val] of Object.entries(query.filter)) {
          q = q.eq(col, val);
        }
      }
      if (query?.limit) q = q.limit(query.limit);
      if (query?.order) q = q.order(query.order.column, { ascending: query.order.ascending ?? true });
      const { data: rows, error } = await q;
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ data: rows });
    }

    if (action === 'insert') {
      const { data: inserted, error } = await supabase.from(table).insert(data).select();
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ data: inserted });
    }

    if (action === 'update') {
      let q = supabase.from(table).update(data);
      if (query?.filter) {
        for (const [col, val] of Object.entries(query.filter)) {
          q = q.eq(col, val);
        }
      }
      const { data: updated, error } = await q.select();
      if (error) return Response.json({ error: error.message }, { status: 400 });
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
        .from(bucket)
        .upload(path, bytes, { contentType: mimeType || 'application/octet-stream', upsert: true });
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
    return Response.json({ error: error.message }, { status: 500 });
  }
});