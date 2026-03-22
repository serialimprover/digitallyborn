import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Let the login page and auth callback through unauthenticated
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/auth/")
  ) {
    return NextResponse.next();
  }

  // Build a response we can attach updated cookies to
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Check admins table with the service-role key to bypass RLS
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );

  const { data: admin } = await adminSupabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .single();

  if (!admin) {
    return NextResponse.redirect(new URL("/admin/login?error=not_admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
