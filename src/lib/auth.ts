// src/lib/auth.ts
import type { AstroCookies } from "astro";
import { supabase } from "./supabase";

export function setAuthCookies(
  cookies: AstroCookies,
  access_token: string,
  refresh_token: string,
) {
  cookies.set("sb-access-token", access_token, {
    sameSite: "strict",
    path: "/",
    secure: true,
    httpOnly: true,
  });
  cookies.set("sb-refresh-token", refresh_token, {
    sameSite: "strict",
    path: "/",
    secure: true,
    httpOnly: true,
  });
}

export function clearAuthCookies(cookies: AstroCookies) {
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
}

export async function checkAndSetSession(cookies: AstroCookies, locals?: App.Locals) {
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");

  if (!accessToken || !refreshToken) {
    return false;
  }

  const { data, error } = await supabase.auth.setSession({
    refresh_token: refreshToken.value,
    access_token: accessToken.value,
  });

  if (error) {
    clearAuthCookies(cookies);
    return false;
  }

  if (locals && data.user) {
    locals.email = data.user.email ?? "";
    locals.name = data.user.user_metadata?.name ?? "";
    locals.avatar_url = data.user.user_metadata?.avatar_url ?? "";
    locals.userId = data.user.id;
  }

  if (data?.session?.access_token && data?.session?.refresh_token) {
      setAuthCookies(cookies, data.session.access_token, data.session.refresh_token);
  }

  return true;
}