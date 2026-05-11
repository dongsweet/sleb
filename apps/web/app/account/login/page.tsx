import type { Metadata } from "next";
import { SiteChrome } from "../../components/SiteChrome";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = {
  title: "Account Login | SLEB",
  description: "Sign in to the SLEB administration workspace.",
};

export default function LoginPage() {
  return (
    <SiteChrome activeArea="Login">
      <main>
        <LoginClient />
      </main>
    </SiteChrome>
  );
}
