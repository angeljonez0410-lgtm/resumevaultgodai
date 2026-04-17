import { getSupabaseAdmin } from "./supabase-admin";

// ─── User Profile ───
export async function getProfile(userId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertProfile(userId: string, fields: Record<string, unknown>) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("user_profiles")
    .upsert({ user_id: userId, ...fields }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Job Applications ───
export async function listApplications(userId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("job_applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function createApplication(userId: string, fields: Record<string, unknown>) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("job_applications")
    .insert({ user_id: userId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateApplication(id: string, userId: string, fields: Record<string, unknown>) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("job_applications")
    .update(fields)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteApplication(id: string, userId: string) {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("job_applications")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

// ─── Saved Resumes ───
export async function listResumes(userId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function createReview(userId: string, fields: Record<string, unknown>) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("reviews")
    .insert({ user_id: userId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}
