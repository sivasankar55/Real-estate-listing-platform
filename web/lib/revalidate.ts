// Asks the web app to drop its cached copy of a listing page after the owner changes it.
export async function revalidateProperty(slug: string, accessToken: string | null) {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ slug }),
    });
  } catch {
    
  }
}
