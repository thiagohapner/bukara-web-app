import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Refresh the session and read validated claims (getClaims, not getSession).
  const { response, claims, supabase } = await updateSession(request);
  const isAuthed = claims !== null;
  const { pathname } = request.nextUrl;

  // Customer account area — require a session, remember where they came from.
  if (pathname.startsWith("/konto") && !isAuthed) {
    const url = new URL("/anmelden", request.url);
    url.searchParams.set("redirectTo", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Admin area. Since customers can now sign in, "authenticated" is no longer
  // sufficient — admin pages read via the service_role key and would otherwise
  // leak all data to any logged-in customer. Gate strictly on staff status.
  if (pathname.startsWith("/admin")) {
    if (!isAuthed) {
      if (pathname !== "/admin/login") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return response; // unauthenticated visitor may see the login form
    }

    const { data: isStaff } = await supabase.schema("v2").rpc("is_staff");

    if (!isStaff) {
      // Logged in, but not a staff member (e.g. a customer). Send them home
      // rather than to /admin/login, which would loop for an authed user.
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname === "/admin/login" || pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/konto/:path*"],
};
