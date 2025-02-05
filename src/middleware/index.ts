// src/middleware/index.ts
import { defineMiddleware } from "astro:middleware";
import { supabase } from "../lib/supabase";
import micromatch from "micromatch";
import { setAuthCookies, deleteAuthCookies, verifySupabaseSession } from "../lib/helpers";

const protectedRoutes = ["/dashboard(|/)"];
const redirectRoutes = ["/signin(|/)", "/register(|/)"];
const proptectedAPIRoutes = ["/api/guestbook(|/)"];

export const onRequest = defineMiddleware(
  async ({ locals, url, cookies, redirect }, next) => {
    if (micromatch.isMatch(url.pathname, protectedRoutes)) {
      const accessToken = cookies.get("sb-access-token");
      const refreshToken = cookies.get("sb-refresh-token");

      if (!accessToken || !refreshToken) {
        return redirect("/signin");
      }

      const { data, error } = await verifySupabaseSession(supabase, accessToken.value, refreshToken.value)

      if (error) {
        deleteAuthCookies(cookies)
        return redirect("/signin");
      }

      locals.email = data.user?.email!;
      setAuthCookies(cookies, data?.session?.access_token!, data?.session?.refresh_token!)
    }

    if (micromatch.isMatch(url.pathname, redirectRoutes)) {
      const accessToken = cookies.get("sb-access-token");
      const refreshToken = cookies.get("sb-refresh-token");

      if (accessToken && refreshToken) {
        return redirect("/dashboard");
      }
    }

    if (micromatch.isMatch(url.pathname, proptectedAPIRoutes)) {
      const accessToken = cookies.get("sb-access-token");
      const refreshToken = cookies.get("sb-refresh-token");

      // Check for tokens
      if (!accessToken || !refreshToken) {
        return new Response(
          JSON.stringify({
            error: "Unauthorized",
          }),
          { status: 401 },
        );
      }

      // Verify the tokens
      const { error } = await verifySupabaseSession(supabase, accessToken.value, refreshToken.value)

      if (error) {
        return new Response(
          JSON.stringify({
            error: "Unauthorized",
          }),
          { status: 401 },
        );
      }
    }

    return next();
  },
);