// src/middleware/index.ts
import { defineMiddleware } from "astro:middleware";
import micromatch from "micromatch";
import { checkAndSetSession } from "../lib/auth";
import { supabase } from "../lib/supabase";

const protectedRoutes = ["/dashboard(|/)"];
const redirectRoutes = ["/signin(|/)", "/register(|/)"];
const proptectedAPIRoutes = ["/api/questions(|/)"];

export const onRequest = defineMiddleware(
  async ({ locals, url, cookies, redirect }, next) => {
    if (micromatch.isMatch(url.pathname, protectedRoutes)) {
        const isLoggedIn = await checkAndSetSession(cookies, locals);
      if (!isLoggedIn) {
        return redirect("/signin");
      }
    }

    if (micromatch.isMatch(url.pathname, redirectRoutes)) {
      const isLoggedIn = await checkAndSetSession(cookies);
      if (isLoggedIn) {
        return redirect("/dashboard");
      }
    }
    if (micromatch.isMatch(url.pathname, proptectedAPIRoutes)) {
      const accessToken = cookies.get("sb-access-token");
      const refreshToken = cookies.get("sb-refresh-token");

      if (!accessToken || !refreshToken) {
        return new Response(
          JSON.stringify({
            error: "Unauthorized",
          }),
          { status: 401 },
        );
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken.value,
        refresh_token: refreshToken.value,
      });

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