import { account, client } from "./appwrite";
import { Teams } from "appwrite";

const teams = new Teams(client);

const MEMBER_TEAM_ID = import.meta.env.PUBLIC_APPWRITE_MEMBER_TEAM_ID;

/**
 * Checks whether the current logged-in user is in the member team.
 */
export async function isMember(): Promise<boolean> {
  try {
    // 1. Ensure user is logged in
    const user = await account.get();
    if (!user) return false;

    // 2. Get the current user's teams
    const teamList = await teams.list();

    // 3. Return true only if the current user belongs to the member team
    return teamList.teams.some((team) => team.$id === MEMBER_TEAM_ID);
  } catch (err) {
    // If user is not logged in OR request fails → not member
    return false;
  }
}

