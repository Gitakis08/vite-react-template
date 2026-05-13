import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

function normalizePhone(value: unknown) {
  if (!value || typeof value !== "string") return null;

  let phone = value.trim().replace(/[\s\-().]/g, "");

  if (/^69\d{8}$/.test(phone) || /^2\d{9}$/.test(phone)) {
    phone = "+30" + phone;
  }

  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    return null;
  }

  return phone;
}

app.post("/api/start", async (c) => {
  let body: { toNumber?: string };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const toNumber = normalizePhone(body.toNumber);

  if (!toNumber) {
    return c.json({ error: "Invalid phone number" }, 400);
  }

  const response = await fetch(
    "https://metron-voice-backend-a4gngmh8f9g8fpat.westeurope-01.azurewebsites.net/calls/start",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ toNumber })
    }
  );

  return c.json(
    {
      ok: response.ok,
      backendStatus: response.status
    },
    response.ok ? 200 : 502
  );
});

export default app;
