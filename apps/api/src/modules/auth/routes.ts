import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { loadEnv } from "../../config/env.js";
import {
  buildExpiredSessionCookie,
  buildSessionCookie,
  createSessionToken,
  readAuthSession,
} from "./session.js";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function registerAuthRoutes(app: FastifyInstance) {
  const env = loadEnv();

  app.post("/auth/login", async (request, reply) => {
    const input = loginSchema.parse(request.body);

    if (
      !matchesAdminCredentials(
        input.email,
        input.password,
        env.ADMIN_EMAIL,
        env.ADMIN_PASSWORD,
      )
    ) {
      return reply.code(401).send({
        error: "Invalid email or password",
      });
    }

    const user = {
      email: env.ADMIN_EMAIL,
      name: env.ADMIN_NAME,
      role: env.ADMIN_CONTENT_ROLE,
    };
    const token = createSessionToken(
      user,
      env.AUTH_SESSION_SECRET,
      env.AUTH_SESSION_TTL_SECONDS,
    );

    return reply
      .header(
        "set-cookie",
        buildSessionCookie(
          token,
          env.AUTH_SESSION_TTL_SECONDS,
          env.AUTH_COOKIE_SECURE,
        ),
      )
      .send({ user });
  });

  app.get("/auth/me", async (request, reply) => {
    const session = readAuthSession(request, env.AUTH_SESSION_SECRET);

    if (!session) {
      return reply.code(401).send({
        error: "Not authenticated",
      });
    }

    return {
      user: {
        email: session.email,
        name: session.name,
        role: session.role,
      },
    };
  });

  app.post("/auth/logout", async (_request, reply) =>
    reply.header("set-cookie", buildExpiredSessionCookie()).send({ ok: true }),
  );
}

function matchesAdminCredentials(
  email: string,
  password: string,
  adminEmail: string,
  adminPassword: string,
) {
  return (
    email.toLowerCase() === adminEmail.toLowerCase() &&
    safeEqual(password, adminPassword)
  );
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}
