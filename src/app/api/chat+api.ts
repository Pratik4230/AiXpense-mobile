import { webApiBase } from "@/lib/env";

export async function POST(req: Request) {
  const cookie = req.headers.get("Cookie") ?? "";
  const body = await req.text();

  const response = await fetch(`${webApiBase()}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body,
  });

  if (!response.ok) {
    return new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
