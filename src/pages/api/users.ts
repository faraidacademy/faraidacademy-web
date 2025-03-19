// src/pages/api/users.ts
import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const GET: APIRoute = async () => {
  const supabaseAdmin = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const participantUsers: App.Locals[] = data.users
    .filter(user => user.user_metadata?.is_participant)
    .map(user => {
      const userData: App.Locals = {
        email: user.email || "", // Provide a default for email
        name: user.user_metadata?.name || "Hidden User", // Use "Hidden User" as default
        avatar_url: user.user_metadata?.avatar_url || "/default-avatar.png",
        userId: user.id, // Use user.id for userId
        createdAt: user.created_at || "", // Use created_at, handle potential null
        school: user.user_metadata?.school,
        phone: user.user_metadata?.phone,
        is_participant: user.user_metadata?.is_participant || false, // default to false
        is_visible: user.user_metadata?.is_visible || false, // default to false if undefined
      };
      return userData;

    });

  return new Response(JSON.stringify({ users: participantUsers }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};