import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { createAdminClient } from "@/app/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "magiclink" | "email",
    });
    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
    }
  } else {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  // Verify user is in the approved_members table
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?error=not_approved", request.url));
  }

  const adminClient = createAdminClient();
  const { data: approved } = await adminClient
    .from("approved_members")
    .select("email")
    .eq("email", user.email)
    .single();

  if (!approved) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?error=not_approved", request.url));
  }

  return NextResponse.redirect(new URL("/members", request.url));
}
