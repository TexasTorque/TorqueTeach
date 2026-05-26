import { useEffect, useState } from "react";
import { tables, DATABASE_ID, COLLECTIONS } from "../lib/appwrite";

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const result = await tables.listRows({
          databaseId: DATABASE_ID,
          tableId: COLLECTIONS.USER_PROFILES,
          queries: []
        });

        if (!alive) return;

        setUsers(result.rows ?? []);
      } catch (err: any) {
        console.error("ADMIN LOAD ERROR:", err);
        if (alive) setError(err.message ?? "Failed to load users");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p>Loading admin panel...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Admin Panel</h1>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul style={{ marginTop: "1rem" }}>
          {users.map((u) => (
            <li key={u.$id} style={{ marginBottom: "0.5rem" }}>
              <a
                href={`/profiles/${u.userID}`}
                style={{
                  color: "var(--sl-color-accent)",
                  textDecoration: "none",
                  fontWeight: 600
                }}
              >
                {u.userName}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}