import { useEffect, useState } from "react";
import { OAuthProvider } from "appwrite";
import { account } from "../lib/appwrite";

export default function HeaderAuth() {
  const [user, setUser] = useState<string | null>(null);
useEffect(() => {
  let alive = true;

  async function run() {
    try {
      const u = await account.get().catch(() => null);

      if (!u) {
        setUser(null);
        return;
      }
      // ONLY set UI state here
      setUser(u.name || u.email || "User");
      const params = new URLSearchParams(window.location.search);
      if (params.get("oauth") === "1") {
        // Clean the URL so it doesn't re-run on refresh
        window.history.replaceState({}, "", window.location.pathname);

        const { createProfileIfNeeded } = await import("../lib/createProfile");
        await createProfileIfNeeded();
      }
      
    } catch {
      if (alive) setUser(null);
    }
  }

  run();

  return () => {
    alive = false;
  };
}, []);

  async function loadUser() {
    try {
      const u = await account.get();
      setUser(u.name || u.email || "User");
    } catch {
      setUser(null); // Guest
    }
  }

  async function loginWithGoogle() {
    try {
      account.createOAuth2Session({
        provider: OAuthProvider.Google,
        success: `${window.location.origin}?oauth=1`, // success
        failure: `${window.location.origin}`      // failure/cancel
      });    
      import("../lib/createProfile")
        .then(({ createProfileIfNeeded }) =>
          createProfileIfNeeded()
        )
        .catch((err) => {});
  
    } catch (err: any) {
      console.error("Login failed:", err);
    }
  }

  async function logout() {
    try {
      await account.deleteSession({sessionId: "current"});
      setUser(null);
    } catch (err: any) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <p>Hello, {user ?? "Guest"}</p>
      {user ? (
        <button onClick={logout}
          style={{
            backgroundColor: "var(--sl-color-accent)",
            color: "var(--sl-color-bg)",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer"
          }}>Logout
        </button>
      ) : (
        <button onClick={loginWithGoogle}
          style={{
            backgroundColor: "var(--sl-color-accent)",
            color: "var(--sl-color-bg)",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer"
          }}>Login
        </button>
      )}
    </div>
  );
}