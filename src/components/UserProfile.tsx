import { useEffect, useState } from "react";
import { account, tables, DATABASE_ID, COLLECTIONS } from "../lib/appwrite";
import { Query } from "appwrite";

type Props = {
  userId?: string;
};

export default function UserProfile({ userId }: Props) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        let targetUserId: string;

        if (userId) {
          targetUserId = userId;
        } else {
          const user = await account.get();
          targetUserId = user.$id;
        }

        const profileResult = await tables.listRows({
          databaseId: DATABASE_ID,
          tableId: COLLECTIONS.USER_PROFILES,
          queries: [Query.equal("userID", targetUserId)]
        });

        const quizResult = await tables.listRows({
          databaseId: DATABASE_ID,
          tableId: COLLECTIONS.QUIZ_ATTEMPTS,
          queries: [
            Query.equal("userID", targetUserId),
            Query.orderDesc("$createdAt")
          ]
        });

        if (!alive) return;

        const row = profileResult.rows?.[0] ?? null;
        setProfile(row);

        const rows = quizResult.rows ?? [];

        // latest quiz per quizID
        const latestPerQuiz: Record<string, any> = {};

        for (const q of rows) {
          if (!q.quizID) continue;

          if (!latestPerQuiz[q.quizID]) {
            latestPerQuiz[q.quizID] = q;
          }
        }

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>No profile found</p>;

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

      <h2>Levels</h2>

      <table style={{ width: "100%" }}>
        <tbody>
          <tr><td>Electrical</td><td>{profile.electricalLevel ?? 0}</td></tr>
          <tr><td>Assembly</td><td>{profile.assemblyLevel ?? 0}</td></tr>
          <tr><td>Design</td><td>{profile.designLevel ?? 0}</td></tr>
          <tr><td>Machining</td><td>{profile.machiningLevel ?? 0}</td></tr>
          <tr><td>Programming</td><td>{profile.programmingLevel ?? 0}</td></tr>
          <tr><td>Awards</td><td>{profile.awardsLevel ?? 0}</td></tr>
          <tr><td>Media</td><td>{profile.mediaLevel ?? 0}</td></tr>
          <tr><td>Outreach</td><td>{profile.outreachLevel ?? 0}</td></tr>
          <tr><td>Scouting</td><td>{profile.scoutingLevel ?? 0}</td></tr>
          <tr><td>Safety</td><td>{profile.safetyLevel ?? 0}</td></tr>
        </tbody>
      </table>

      <h2>Quizzes</h2>

      <table style={{ width: "100%", marginTop: "0.5rem" }}>
        <tbody>
          {quizzes.map((q) => (
            <tr key={q.quizID}>
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