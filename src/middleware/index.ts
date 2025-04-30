// src/middleware/index.ts
import { defineMiddleware } from "astro:middleware";
import micromatch from "micromatch";
import { checkAndSetSession, clearAuthCookies } from "../lib/auth";
import { supabase } from "../lib/supabase";

const protectedRoutes = [
    "/dashboard(|/)",
    "/competition",
    "/competition/**",
];
const redirectRoutes = ["/signin(|/)", "/register(|/)"];
const protectedAPIRoutes = ["/api/answers(|/)", "/api/profile(|/)"];

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

    if (micromatch.isMatch(url.pathname, protectedAPIRoutes)) {
      const refreshToken = cookies.get("sb-refresh-token");
        console.log("Middleware: Checking API route:", url.pathname, refreshToken);

      if (!refreshToken) {
          return new Response(
            JSON.stringify({
              error: "Unauthorized",
            }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
      }

      const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Middleware: session:", session, "error:", error);

        if (error || !session) {
            clearAuthCookies(cookies);
            return new Response(
                JSON.stringify({
                    error: "Unauthorized",
                }),
                { status: 401, headers: { "Content-Type": "application/json" } },
            );
        }

      locals.userId = session.user.id;

    }

    return next();
  },
);