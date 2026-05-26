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

    // 2. Get memberships of this user ONLY for the member team
    const memberships = await teams.listMemberships(MEMBER_TEAM_ID);

    // 3. If user appears in that team → member
    return memberships.memberships.length > 0;
  } catch (err) {
    // If user is not logged in OR request fails → not member
    return false;
  }
}

