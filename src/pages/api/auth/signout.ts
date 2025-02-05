import type { APIRoute } from "astro";
import { deleteAuthCookies } from "../../../lib/helpers";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  deleteAuthCookies(cookies)
  return redirect("/signin");
};