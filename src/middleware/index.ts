// src/middleware/index.ts
import { defineMiddleware } from "astro:middleware";
import micromatch from "micromatch";
import { checkAndSetSession, setAuthCookies, clearAuthCookies } from "../lib/auth"; // Import setAuthCookies and clearAuthCookies
import { supabase } from "../lib/supabase";

const protectedRoutes = [
    "/dashboard(|/)",
    "/competition",
    "/competition/**",
];
const redirectRoutes = ["/signin(|/)", "/register(|/)"];
const protectedAPIRoutes = ["/api/questions(|/)", "/api/answers(|/)"];

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
      const accessToken = cookies.get("sb-access-token");
      const refreshToken = cookies.get("sb-refresh-token");
        console.log("Middleware: Checking API route:", url.pathname, accessToken, refreshToken); // Keep this log

      if (!refreshToken) { // Only need to check refresh token
          return new Response(
            JSON.stringify({
              error: "Unauthorized",
            }),
            { status: 401, headers: { "Content-Type": "application/json" } }, // Set content type
          );
      }

      const { data: { session }, error } = await supabase.auth.getSession(); // Use getSession
        console.log("Middleware: session:", session, "error:", error);

        if (error || !session) {
            clearAuthCookies(cookies); // Clear cookies if session is invalid
            return new Response(
                JSON.stringify({
                    error: "Unauthorized",
                }),
                { status: 401, headers: { "Content-Type": "application/json" } }, // Set content type
            );
        }

        //check and set cookies
        if(session.access_token !== cookies.get("sb-access-token")?.value || session.refresh_token !== cookies.get("sb-refresh-token")?.value){
            setAuthCookies(cookies, session.access_token, session.refresh_token);
        }
      locals.userId = session.user.id; // Set locals.userId here! VERY IMPORTANT

    }

    return next();
  },
);