import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.set("uid", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect") ?? "/signin";
  return Response.redirect(new URL(redirectTo, url.origin), 303);
}
