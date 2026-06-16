// `db` is the entity API used across the app. It shares a single
// implementation with `api.entities` (see src/api/createEntityAPI.js),
// both routed through the `supabase` compatibility function on SlatFit BE.
export { entities as db, createEntityAPI } from '@/api/createEntityAPI';
