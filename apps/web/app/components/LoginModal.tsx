"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

type LoginResponse = {
  user?: {
    email: string;
    name: string;
    role: string;
  };
  error?: string;
};

export function LoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("admin@sleb.local");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setNotice("");
      return;
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey as any);
    return () => document.removeEventListener("keydown", handleKey as any);
  }, [open, onClose]);

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

  if (!open) return null;

  return (
    <div
      className="modalOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modalDialog"
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
        ref={dialogRef}
      >
        <button
          className="modalClose"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          &times;
        </button>
        <form className="loginPanel" onSubmit={submitLogin}>
          <div>
            <p className="eyebrow">Admin sign in</p>
            <h1>Account Login</h1>
            {notice && <p>{notice}</p>}
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
      </div>
    </div>
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
