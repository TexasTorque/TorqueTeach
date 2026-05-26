import { account, databases, tables, DATABASE_ID, COLLECTIONS } from "./appwrite";
import { isMember } from "./isMember";

export async function saveQuizAttempt({
  quizId,
  score,
  total
}: {
  quizId: string;
  score: number;
  total: number;
}) {
  const member = await isMember();
  const user = await account.get();

  if (!member) {
      alert("You must be a member to save quiz progress.");
      return;
  }
  return tables.createRow({
    databaseId: DATABASE_ID,
    tableId: COLLECTIONS.QUIZ_ATTEMPTS,
    rowId: "unique()",
    data: {
      userID: user.$id,
      quizID: quizId,
      score: Math.round((score / total) * 100),
      $createdAt: new Date().toISOString(),
      userName: user.name
    }
});
}