import { cookies } from "next/headers";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window === "undefined"
    ? "http://localhost:4000"
    : "http://localhost:4000");

const buildCookieHeader = async () => {
  const cookieStore = await cookies();
  const cookiePairs = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`);

  return cookiePairs.join("; ");
};

export const apiFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${apiBaseUrl}${path}`;
  const headers = new Headers(options.headers || {});

  if (typeof window === "undefined") {
    const cookieHeader = await buildCookieHeader();
    if (cookieHeader) {
      headers.set("cookie", cookieHeader);
    }
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
};
