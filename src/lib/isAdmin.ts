import { account, client } from "./appwrite";
import { Teams } from "appwrite";

const teams = new Teams(client);

const ADMIN_TEAM_ID = import.meta.env.PUBLIC_APPWRITE_ADMIN_TEAM_ID;

/**
 * Checks whether the current logged-in user is in the admin team.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    // 1. Ensure user is logged in
    const user = await account.get();
    if (!user) return false;

    const result =
      await teams.list();

    return result.teams.some(
      (team)=>
        team.$id===ADMIN_TEAM_ID
    );
  } catch (err) {
    // If user is not logged in OR request fails → not admin
    return false;
  }
}
