import { useEffect, useState } from "react";
import { account, tables, DATABASE_ID, COLLECTIONS } from "../lib/appwrite";
import { Query } from "appwrite";
import { updateLevel, type LevelField } from "../lib/updateLevel";
import { isAdmin as checkAdmin } from "../lib/isAdmin";

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // ─────────────────────────────
  // RESOLVE USER ID
  // ─────────────────────────────
 useEffect(() => {
  let alive = true;

  async function resolveUserId() {
    try {
      // current logged in user
      const currentUser = await account.get();

      if (!alive) return;

      // check admin status using the current isAdmin implementation
      const isUserAdmin = await checkAdmin();

      if (!alive) return;

      setAdmin(isUserAdmin);

      const params = new URLSearchParams(window.location.search);

      const urlUserId = params.get("userId");

      // ONLY admins can override profile target
      if (isUserAdmin && urlUserId) {
        setUserId(urlUserId);
        return;
      }

      // everyone else gets own profile only
      setUserId(currentUser.$id);

    } catch (err) {
      console.error("Failed to resolve user:", err);

      if (alive) {
        setUserId(null);
        setLoading(false);
      }
    }
  }

  resolveUserId();

  return () => {
    alive = false;
  };

}, []);

  // ─────────────────────────────
  // MAIN LOAD
  // ─────────────────────────────
  useEffect(() => {
    if (!userId) return;

    let alive = true;

    async function run() {
      try {
        setLoading(true);

        const targetUserId = userId;

        if (!targetUserId) {
          setLoading(false);
          return;
        }
        if (!alive) return;
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

        if (alive) {
          setError(err.message ?? "Unknown error");
        }

      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      alive = false;
    };

  }, [userId]);

  // ─────────────────────────────
  // LEVEL UPDATE HANDLER
  // ─────────────────────────────
  async function changeLevel(field: LevelField, delta: number) {
    if (!admin || !profile) return;

    const current = profile[field] ?? 0;
    const next = Math.max(current + delta, 0);

    const profileId = profile.$id;

    // optimistic update
    setProfile((prev: any) => ({
      ...prev,
      [field]: next
    }));

    try {
      await updateLevel(profileId, field, next);

    } catch (err) {
      console.error("Failed to update level:", err);

      // rollback
      setProfile((prev: any) => ({
        ...prev,
        [field]: current
      }));
    }
  }

  // ─────────────────────────────
  // LEVEL FIELDS
  // ─────────────────────────────
  const levelFields: LevelField[] = [
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
  ];

  // ─────────────────────────────
  // STATES
  // ─────────────────────────────
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!profile) {
    return <p>No profile found</p>;
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

      <h2 style={{ marginTop: "1rem" }}>
        Levels
      </h2>

      <table style={{ width: "100%", marginTop: "0.5rem" }}>
        <tbody>

          {levelFields.map((field) => (

            <tr key={field}>

              <td>
                {field.replace("Level", "")}
              </td>

              <td>
                {profile[field] ?? 0}

                {admin && (
                  <span
                    style={{
                      marginLeft: "10px",
                      display: "inline",
                      alignItems: "center"
                    }}
                  >

                    <button
                      onClick={() => changeLevel(field, +1)}
                      style={{
                        backgroundColor: "var(--sl-color-accent)",
                        fontWeight: "bold",
                        color: "var(--sl-color-bg)",
                        border: "2px solid var(--sl-color-bg)",
                        padding: "0",
                        borderRadius: "6px",
                        cursor: "pointer",
                        width: "28px",
                        height: "28px",
                        lineHeight: "28px",
                        textAlign: "center",
                        display: "inline-flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      +
                    </button>

                    <button
                      onClick={() => changeLevel(field, -1)}
                      style={{
                        backgroundColor: "var(--sl-color-accent)",
                        fontWeight: "bold",
                        color: "var(--sl-color-bg)",
                        border: "2px solid var(--sl-color-bg)",
                        padding: "0",
                        borderRadius: "6px",
                        cursor: "pointer",
                        width: "28px",
                        height: "28px",
                        lineHeight: "28px",
                        textAlign: "center",
                        display: "inline-flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      -
                    </button>

                  </span>
                )}

              </td>

            </tr>

          ))}

        </tbody>
      </table>

      <h2 style={{ marginTop: "1rem" }}>
        Quizzes
      </h2>

      <table style={{ width: "100%", marginTop: "0.5rem" }}>
        <tbody>

          {quizzes.map((q) => (

            <tr key={q.$id ?? q.quizID}>

              <td>
                {q.quizID}
              </td>

              <td>
                {q.score}%
              </td>

              <td>
                {new Date(q.$createdAt).toLocaleDateString()}
              </td>

            </tr>

          ))}

        </tbody>
      </table>

    </div>
  );
}