"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type LoginResponse = {
  user?: {
    email: string;
    name: string;
    role: string;
  };
  error?: string;
};

export function LoginClient() {
  const [email, setEmail] = useState("admin@sleb.local");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState(
    "Sign in with the test administrator account.",
  );
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    void checkExistingSession();
  }, []);

  async function checkExistingSession() {
    const response = await fetch("/api/auth/me", {
      cache: "no-store",
      credentials: "include",
    });

    if (response.ok) {
      setNotice("You are already signed in.");
    }
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setNotice("Signing in...");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const payload = (await response.json()) as LoginResponse;

      if (!response.ok || !payload.user) {
        throw new Error(
          payload.error ?? `Login failed with ${response.status}`,
        );
      }

      setNotice(`Signed in as ${payload.user.name}.`);
      window.location.href = getReturnUrl();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="loginShell">
      <form className="loginPanel" onSubmit={submitLogin}>
        <div>
          <p className="eyebrow">Admin sign in</p>
          <h1>Account Login</h1>
          <p>{notice}</p>
        </div>
        <label>
          Email
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <button disabled={isBusy} type="submit">
          Sign in
        </button>
      </form>
    </section>
  );
}

function getReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get("returnTo");

  if (returnTo?.startsWith("/")) {
    return returnTo;
  }

  return "/admin/content";
}
