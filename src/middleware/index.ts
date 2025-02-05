import { defineMiddleware } from "astro:middleware";
import { supabase } from "../lib/supabase";
import micromatch from "micromatch";

const protectedRoutes = ["/dashboard(|/)"];
const redirectRoutes = ["/signin(|/)", "/register(|/)"];
const protectedAPIRoutes = ["/api/guestbook(|/)"];

// Centralized session validation function
const validateSession = async (cookies: any) => {
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");

  if (!accessToken || !refreshToken) return null;

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken.value,
    refresh_token: refreshToken.value,
  });

  if (error) return null;
  return data;
};

export const onRequest = defineMiddleware(async ({ locals, url, cookies, redirect }, next) => {
  const session = await validateSession(cookies);

  if (micromatch.isMatch(url.pathname, protectedRoutes)) {
    if (!session || !session.session) return redirect("/signin");

    // Ensure session and session.session exist before accessing properties
    locals.email = session.user?.email!;
    cookies.set("sb-access-token", session.session.access_token, {
      sameSite: "strict",
      path: "/",
      secure: true,
    });
    cookies.set("sb-refresh-token", session.session.refresh_token, {
      sameSite: "strict",
      path: "/",
      secure: true,
    });
  }

  if (micromatch.isMatch(url.pathname, redirectRoutes)) {
    if (session && session.session) return redirect("/dashboard");
  }

  if (micromatch.isMatch(url.pathname, protectedAPIRoutes)) {
    if (!session || !session.session) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401 },
      );
    }
  }

  return next();
});