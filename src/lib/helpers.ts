// src/lib/helpers.ts
import { type CookieSerializeOptions } from "cookie";

export function createErrorResponse(message: string, status: number = 500): Response {
    return new Response(
        JSON.stringify({ error: message }),
        { status: status }
    );
}

const cookieOptions: CookieSerializeOptions = {
    sameSite: "strict",
    path: "/",
    secure: true,
};

export function setAuthCookies(cookies: any, accessToken: string, refreshToken: string) {
    cookies.set("sb-access-token", accessToken, cookieOptions);
    cookies.set("sb-refresh-token", refreshToken, cookieOptions);
}

export function deleteAuthCookies(cookies: any) {
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });
}

export async function verifySupabaseSession(supabase: any, accessToken: string, refreshToken: string) {
    const { data, error } = await supabase.auth.setSession({
        refresh_token: refreshToken,
        access_token: accessToken,
    });

    return { data, error }
}

export function getOAuthRedirectURI(): string {
    return import.meta.env.DEV
        ? "http://localhost:4321/api/auth/callback"
        : "https://astro-supabase-auth.vercel.app/api/auth/callback";
}