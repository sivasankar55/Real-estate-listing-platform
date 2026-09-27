import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!slug || !token) {
    return NextResponse.json({ error: "A token and slug are required." }, { status: 400 });
  }


  const [meResponse, propertyResponse] = await Promise.all([
    fetch(`${apiUrl}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    fetch(`${apiUrl}/api/properties/${encodeURIComponent(slug)}`, { cache: "no-store" })
  ]);
  if (!meResponse.ok || !propertyResponse.ok) {
    return NextResponse.json({ error: "Could not verify the listing." }, { status: 403 });
  }

  const [me, property] = await Promise.all([meResponse.json(), propertyResponse.json()]);
  if (me.id !== property.owner?.id) {
    return NextResponse.json({ error: "That listing belongs to another account." }, { status: 403 });
  }

  revalidatePath(`/properties/${slug}`);
  return NextResponse.json({ revalidated: true });
}
