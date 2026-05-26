import { useEffect, useState } from "react";

export default function AdminShortcut() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        // IMPORTANT: lazy-load inside effect (prevents hydration/module issues)
        const { isAdmin } = await import("../lib/isAdmin");

        const ok = await isAdmin();

        if (alive) {
          setVisible(ok);
        }
      } catch (err) {
        if (alive) {
          setVisible(false);
        }
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, []);

  // nothing renders unless confirmed admin
  if (!visible) return null;

  return (
    <a
      href="/adminpanel"
      style={{
        display: "inline-block",
        marginTop: "12px",
        padding: "10px 14px",
        background: "var(--sl-color-accent)",
        color: "var(--sl-color-bg)",
        borderRadius: "8px",
        fontWeight: 600,
        textDecoration: "none"
      }}
    >
      Admin Panel
    </a>
  );
}