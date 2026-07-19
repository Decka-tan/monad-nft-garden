// same-origin /api on vercel + vite proxy locally
export function getApiBase() {
  const fromEnv = import.meta.env.VITE_GARDEN_API_URL;
  if (fromEnv?.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return "/api";
}

export async function getJson<T>(path: string): Promise<T> {
  const url = new URL(
    `${getApiBase()}${path}`,
    window.location.origin,
  );

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function postJson<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const url = new URL(
    `${getApiBase()}${path}`,
    window.location.origin,
  );

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }

  return res.json() as Promise<T>;
}
