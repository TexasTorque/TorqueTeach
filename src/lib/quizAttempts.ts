import { ID, Permission, Role } from "appwrite";
import { account, tables, DATABASE_ID, COLLECTIONS } from "./appwrite";
import { isMember } from "./isMember";
const ADMIN_TEAM_ID = import.meta.env.PUBLIC_APPWRITE_ADMIN_TEAM_ID;

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
  if (!member) {
    return;
  }
  const user = await account.get();
  
  return tables.createRow({
    databaseId: DATABASE_ID,
    tableId: COLLECTIONS.QUIZ_ATTEMPTS,
    rowId: ID.unique(),
    data: {
      userID: user.$id,
      quizID: quizId,
      score: Math.round((score / total) * 100),
      userName: user.name
    },
    permissions: [
      Permission.read(Role.user(user.$id))    ]
});
}