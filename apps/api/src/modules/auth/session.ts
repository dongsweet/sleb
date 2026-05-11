import { createHmac, timingSafeEqual } from "node:crypto";
import type { FastifyRequest } from "fastify";

export const authCookieName = "sleb_session";

export const authRoles = [
  "content_author",
  "content_publisher",
  "platform_admin",
] as const;

export type AuthRole = (typeof authRoles)[number];

export type AuthSession = {
  email: string;
  name: string;
  role: AuthRole;
  exp: number;
};

type SessionInput = Omit<AuthSession, "exp">;

export function createSessionToken(
  input: SessionInput,
  secret: string,
  ttlSeconds: number,
) {
  const payload: AuthSession = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signature = sign(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export function readAuthSession(request: FastifyRequest, secret: string) {
  const token = parseCookies(request.headers.cookie)[authCookieName];

  if (!token) {
    return undefined;
  }

  const [encodedPayload, signature] = token.split(".");

  if (
    !encodedPayload ||
    !signature ||
    !safeEqual(signature, sign(encodedPayload, secret))
  ) {
    return undefined;
  }

  try {
    const session = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as AuthSession;

    if (
      !isAuthRole(session.role) ||
      session.exp <= Math.floor(Date.now() / 1000)
    ) {
      return undefined;
    }

    return session;
  } catch {
    return undefined;
  }
}

export function buildSessionCookie(
  token: string,
  maxAgeSeconds: number,
  secure: boolean,
) {
  return [
    `${authCookieName}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
    secure ? "Secure" : undefined,
  ]
    .filter(Boolean)
    .join("; ");
}

export function buildExpiredSessionCookie() {
  return `${authCookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

function parseCookies(header: string | undefined) {
  return Object.fromEntries(
    (header ?? "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf("=");

        if (separator === -1) {
          return [part, ""];
        }

        return [part.slice(0, separator), part.slice(separator + 1)];
      }),
  );
}

function isAuthRole(value: string): value is AuthRole {
  return authRoles.includes(value as AuthRole);
}
