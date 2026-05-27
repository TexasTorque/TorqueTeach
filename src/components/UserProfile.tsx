import { useEffect, useState } from "react";
import { account, tables, DATABASE_ID, COLLECTIONS } from "../lib/appwrite";
import { Query } from "appwrite";
import { updateLevel } from "../lib/updateLevel";
import { isAdmin as checkAdmin } from "../lib/isAdmin";

type Props = {
  userId?: string;
};

export default function UserProfile({ userId }: Props) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        // ✔ FIXED: proper async admin check
        const isUserAdmin = await checkAdmin();
        if (!alive) return;
        setAdmin(isUserAdmin);

        let targetUserId: string;

        if (userId) {
          targetUserId = userId;
        } else {
          const user = await account.get();
          targetUserId = user.$id;
        }

        // ─────────────────────────────
        // PROFILE FETCH
        // ─────────────────────────────
        const result = await tables.listRows({
          databaseId: DATABASE_ID,
          tableId: COLLECTIONS.USER_PROFILES,
          queries: [Query.equal("userID", targetUserId)]
        });

        const row = result.rows?.[0] ?? null;
        if (!alive) return;
        setProfile(row);

        // ─────────────────────────────
        // QUIZ FETCH
        // ─────────────────────────────
        const quizResult = await tables.listRows({
          databaseId: DATABASE_ID,
          tableId: COLLECTIONS.QUIZ_ATTEMPTS,
          queries: [
            Query.equal("userID", targetUserId),
            Query.orderDesc("$createdAt")
          ]
        });

        const rows = quizResult.rows ?? [];

        const latestPerQuiz: Record<string, any> = {};

        for (const q of rows) {
          if (!latestPerQuiz[q.quizID]) {
            latestPerQuiz[q.quizID] = q;
          }
        }

        if (!alive) return;

        setQuizzes(Object.values(latestPerQuiz));
      } catch (err: any) {
        console.error("PROFILE ERROR:", err);
        if (alive) setError(err.message ?? "Unknown error");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [userId]);

  // ─────────────────────────────
  // LOADING / ERROR STATES
  // ─────────────────────────────
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>No profile found</p>;

  // ─────────────────────────────
  // LEVEL UPDATE HANDLER
  // ─────────────────────────────
  async function changeLevel(field: string, delta: number) {
    if (!admin) return;

    let current = 0;
    let next = 0;
    let profileId: string | null = null;

    setProfile((prev: any) => {
      if (!prev) return prev;

      current = prev[field] ?? 0;
      next = Math.max(current + delta, 0);
      profileId = prev.$id;

      return { ...prev, [field]: next };
    });

    if (!profileId) return;

    try {
      await updateLevel(profileId, field, next);
    } catch (err) {
      console.error("Failed to update level:", err);
      setProfile((prev: any) => {
        if (!prev || prev.$id !== profileId) return prev;
        return { ...prev, [field]: current };
      });
    }
  }

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div
      style={{
        maxWidth: "700px",
        padding: "1.5rem",
        borderRadius: "12px",
        border: "1px solid var(--sl-color-gray-5)"
      }}
    >
      <h1>{profile.userName}</h1>

      <h2 style={{ marginTop: "1rem" }}>Levels</h2>

      <table style={{ width: "100%", marginTop: "0.5rem" }}>
        <tbody>
          {[
            "electricalLevel",
            "assemblyLevel",
            "designLevel",
            "machiningLevel",
            "programmingLevel",
            "awardsLevel",
            "mediaLevel",
            "outreachLevel",
            "scoutingLevel",
            "safetyLevel"
          ].map((field) => (
            <tr key={field}>
              <td>{field.replace("Level", "")}</td>

              <td>
                {profile[field] ?? 0}

                {admin && (
                  <span style={{ marginLeft: "10px", display: "inline", gap: "12px", alignItems: "center" }}>
                    <button onClick={() => changeLevel(field, +1)}
                      style={{
                        backgroundColor: "var(--sl-color-accent)",
                        fontWeight: "bold",
                        color: "var(--sl-color-bg)",
                        border: "none",
                        padding: "0",
                        borderRadius: "6px",
                        cursor: "pointer",
                        width: "28px",
                        height: "28px",
                        lineHeight: "28px",
                        textAlign: "center",
                        display: "inline-flex",
                        justifyContent: "center",
                      }}>+</button>
                    <button onClick={() => changeLevel(field, -1)}
                      style={{
                        backgroundColor: "var(--sl-color-accent)",
                        fontWeight: "bold",
                        color: "var(--sl-color-bg)",
                        border: "none",
                        padding: "0",
                        borderRadius: "6px",
                        cursor: "pointer",
                        width: "28px",
                        height: "28px",
                        lineHeight: "28px",
                        textAlign: "center",
                        display: "inline-flex",
                        justifyContent: "center"
                      }}>-</button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: "1rem" }}>Quizzes</h2>

      <table style={{ width: "100%", marginTop: "0.5rem" }}>
        <tbody>
          {quizzes.map((q) => (
            <tr key={q.$id ?? q.quizID}>
              <td>{q.quizID}</td>
              <td>{q.score}%</td>
              <td>{new Date(q.$createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}