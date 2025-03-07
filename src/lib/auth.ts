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
    const refreshToken = cookies.get("sb-refresh-token");

    if (!refreshToken) {
        return false;
    }

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        clearAuthCookies(cookies);
        return false;
    }

    if(session.access_token !== cookies.get("sb-access-token")?.value || session.refresh_token !== cookies.get("sb-refresh-token")?.value){
        setAuthCookies(cookies, session.access_token, session.refresh_token);
    }
    

    if (locals && session.user) {
        locals.email = session.user.email ?? "";
        locals.name = session.user.user_metadata?.name ?? "";
        locals.avatar_url = session.user.user_metadata?.avatar_url ?? "";
        locals.userId = session.user.id;
    }

    return true;
}