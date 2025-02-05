import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import { setAuthCookies } from "../../../lib/utils";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const authCode = url.searchParams.get("code");

  if (!authCode) {
    return new Response("No code provided", { status: 400 });
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const { access_token, refresh_token } = data.session;
  setAuthCookies(cookies, access_token, refresh_token);
  return redirect("/dashboard");
};