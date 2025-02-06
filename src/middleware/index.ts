// src/middleware/index.ts
import { defineMiddleware } from "astro:middleware";
import micromatch from "micromatch";
import { checkAndSetSession } from "../lib/auth"; // Import helper
import { supabase } from "../lib/supabase";
// ... (rest of imports) ...

const protectedRoutes = ["/dashboard(|/)"];
const redirectRoutes = ["/signin(|/)", "/register(|/)"];
const proptectedAPIRoutes = ["/api/guestbook(|/)"];

export const onRequest = defineMiddleware(
  async ({ locals, url, cookies, redirect }, next) => {
    if (micromatch.isMatch(url.pathname, protectedRoutes)) {
        const isLoggedIn = await checkAndSetSession(cookies, locals); //Use helper
      if (!isLoggedIn) {
        return redirect("/signin");
      }
    }

    if (micromatch.isMatch(url.pathname, redirectRoutes)) {
      const isLoggedIn = await checkAndSetSession(cookies);  // Use helper
      if (isLoggedIn) {
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