import { supabase } from "./supabase";

// Utility function to set auth cookies
export const setAuthCookies = (cookies: any, access_token: string, refresh_token: string) => {
  cookies.set("sb-access-token", access_token, {
    path: "/",
    secure: true,
    httpOnly: true,
  });
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
    secure: true,
    httpOnly: true,
  });
};