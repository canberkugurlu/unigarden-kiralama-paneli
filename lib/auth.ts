import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "unigarden-kiralama-jwt-gizli-2024"
);
export const COOKIE = "kiralama_token";

export interface KiralamaPanelPayload {
  id: string;
  ad: string;
  soyad: string;
  email: string;
  rol: string;
}

export async function signToken(payload: KiralamaPanelPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<KiralamaPanelPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as KiralamaPanelPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<KiralamaPanelPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
