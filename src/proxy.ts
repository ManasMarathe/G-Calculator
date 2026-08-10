import { NextResponse, type NextRequest } from "next/server";
import { PIN_COOKIE, sha256Hex } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  const pin = process.env.G_TRACKER_PIN;
  // No PIN configured → leave the door open rather than locking everyone out.
  if (!pin) return NextResponse.next();

  const cookie = request.cookies.get(PIN_COOKIE)?.value;
  if (cookie && cookie === (await sha256Hex(pin))) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Everything except the login page, Next internals, and static files.
  matcher: ["/((?!login|_next|favicon\\.ico|.*\\..*).*)"],
};
