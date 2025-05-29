// src/lib/auth.ts
import type { AstroCookies } from "astro";
import { supabase } from "./supabase"; // Your existing Supabase client

export function setAuthCookies(
  cookies: AstroCookies,
  access_token: string,
  refresh_token: string,
) {
  cookies.set("sb-access-token", access_token, {
    sameSite: "strict",
    path: "/",
    secure: !import.meta.env.DEV, // Ensure secure is conditional
    httpOnly: true,
    // Consider maxAge or expires for tokens if appropriate
  });
  cookies.set("sb-refresh-token", refresh_token, {
    sameSite: "strict",
    path: "/",
    secure: !import.meta.env.DEV, // Ensure secure is conditional
    httpOnly: true,
    // Consider maxAge or expires for tokens if appropriate
  });
}

export function clearAuthCookies(cookies: AstroCookies) {
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
}

export async function checkAndSetSession(cookies: AstroCookies, locals?: App.Locals) {
    let accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;

    if (!refreshToken) {
        // If there's no refresh token, authentication is not possible.
        // No need to clear cookies here if they don't exist or are already invalid.
        return false;
    }

    let sessionToUse;
    let userToUse;
    let errorOccurred = false;

    if (!accessToken) {
        // Access token is missing; try to refresh the session using only the refresh token.
        // console.log("Access token missing, attempting refresh with refresh token.");
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

        if (refreshError || !refreshData.session || !refreshData.user) {
            // console.error("Failed to refresh session with only refresh token:", refreshError?.message);
            errorOccurred = true;
        } else {
            sessionToUse = refreshData.session;
            userToUse = refreshData.user;
            // Important: Update cookies with the new tokens obtained from refresh.
            setAuthCookies(cookies, sessionToUse.access_token, sessionToUse.refresh_token);
        }
    } else {
        // Both access and refresh tokens are present.
        // Set the session; this will also attempt to refresh if the access token is expired.
        const { data: setData, error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        if (setError || !setData.session || !setData.user) {
            // console.error("Failed to set/validate session:", setError?.message);
            errorOccurred = true;
        } else {
            sessionToUse = setData.session;
            userToUse = setData.user;
            // Check if tokens were changed by setSession (e.g., due to refresh)
            // and update cookies if necessary.
            if (sessionToUse.access_token !== accessToken || sessionToUse.refresh_token !== refreshToken) {
                setAuthCookies(cookies, sessionToUse.access_token, sessionToUse.refresh_token);
            }
        }
    }

    if (errorOccurred || !sessionToUse || !userToUse) {
        clearAuthCookies(cookies); // Clear cookies if any part of session validation/refresh failed
        return false;
    }

    // If execution reaches here, user is authenticated.
    // Populate Astro.locals with user details.
    if (locals && userToUse) {
        locals.email = userToUse.email ?? "";
        locals.name = userToUse.user_metadata?.name ?? "";
        locals.avatar_url = userToUse.user_metadata?.avatar_url ?? "";
        locals.userId = userToUse.id;
        locals.createdAt = userToUse.created_at;
        locals.school = userToUse.user_metadata?.school ?? undefined;
        locals.phone = userToUse.user_metadata?.phone ?? undefined;
        locals.is_participant = userToUse.user_metadata?.is_participant ?? undefined;
        // Make sure your App.Locals reflects that is_participant can be boolean | undefined
        // If it's boolean | undefined in env.d.ts, but in user_metadata it's just boolean or absent,
        // then `?? false` or `?? undefined` is appropriate based on your env.d.ts.
        // The `src/env.d.ts` shows `is_participant: boolean | undefined;`, so `?? undefined` is fine if the metadata might be missing.
        // Or, if you want it to default to false if missing from metadata:
        // locals.is_participant = userToUse.user_metadata?.is_participant ?? false;

        locals.is_visible = userToUse.user_metadata?.is_visible ?? undefined;
        // Similarly for is_visible, based on `src/env.d.ts` `is_visible: boolean | undefined;`
        // Defaulting to false if missing:
        // locals.is_visible = userToUse.user_metadata?.is_visible ?? false;
    }
    return true;
}