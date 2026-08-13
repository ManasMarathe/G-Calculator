import { NextResponse, type NextRequest } from "next/server";
import { PIN_COOKIE, sha256Hex } from "@/lib/auth";

// The PIN is a constant per deployment — hash it once, not on every request.
let expectedHash: Promise<string> | undefined;

export default async function proxy(request: NextRequest) {
  const pin = process.env.G_TRACKER_PIN;
  // No PIN configured → leave the door open rather than locking everyone out.
  if (!pin) return NextResponse.next();

  const cookie = request.cookies.get(PIN_COOKIE)?.value;
  if (cookie && cookie === (await (expectedHash ??= sha256Hex(pin)))) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Everything except the login page, the keepalive cron, Next internals, and
  // static files. The cron has no PIN cookie and must reach the DB anyway.
  matcher: ["/((?!login|api/keepalive|_next|favicon\\.ico|.*\\..*).*)"],
};
