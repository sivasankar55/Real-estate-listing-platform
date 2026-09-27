import { NextResponse, type NextRequest } from "next/server";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";


export async function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/").filter(Boolean).at(-1);
  if (!slug) return NextResponse.next();

  try {
    const response = await fetch(`${apiUrl}/api/properties/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (response.status === 404) {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch {
    
  }
  return NextResponse.next();
}

export const config = { matcher: "/properties/:slug" };
