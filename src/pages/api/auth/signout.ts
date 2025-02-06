// src/pages/api/auth/signout.ts
import type { APIRoute } from "astro";
import { clearAuthCookies } from "../../../lib/auth"; // Import

export const GET: APIRoute = async ({ cookies, redirect }) => {
  clearAuthCookies(cookies); // Use helper
  return redirect("/signin");
};