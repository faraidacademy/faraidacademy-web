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
    // Always attempt to set session data for ALL requests if cookies are present.
    // This will populate Astro.locals if the user is logged in.
    const isUserLoggedIn = await checkAndSetSession(cookies, locals);

    if (micromatch.isMatch(url.pathname, protectedRoutes)) {
      if (!isUserLoggedIn) {
        // The route is protected and user is not logged in, redirect.
        return redirect("/signin");
      }
    }

    if (micromatch.isMatch(url.pathname, redirectRoutes)) {
      if (isUserLoggedIn) {
        // Route is a signin/register page and user is logged in, redirect.
        return redirect("/dashboard");
      }
    }

    if (micromatch.isMatch(url.pathname, protectedAPIRoutes)) {
      // For protected API routes, if Astro.locals.userId wasn't populated by checkAndSetSession,
      // it means the user is not authenticated.
      if (!locals.userId) {
        return new Response(
          JSON.stringify({
            error: "Unauthorized",
          }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }
      // locals.userId is already available if isUserLoggedIn was true.
    }

    return next();
  },
);