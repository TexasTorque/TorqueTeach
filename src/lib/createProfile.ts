import { ID, Query, Permission, Role } from "appwrite";
import {
  account,
  tables,
  DATABASE_ID,
  COLLECTIONS
} from "./appwrite";
import { isMember } from "./isMember";
const ADMIN_TEAM_ID = import.meta.env.PUBLIC_APPWRITE_ADMIN_TEAM_ID;

export async function createProfileIfNeeded() {
  try {
    const user = await account.get();
    const member = await isMember();
    if(!member){
        return;
    }

    const existing =
      await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: COLLECTIONS.USER_PROFILES,
        queries: [
          Query.equal(
            "userID",
            user.$id
          )
        ]
  });

    if ((existing.rows?.length ?? 0) > 0) {
      return;
    }
    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.USER_PROFILES, 
      rowId: ID.unique(), 
      data: {
        userID: user.$id,
        userName: user.name
      },
      permissions: [
        Permission.read(Role.team(ADMIN_TEAM_ID)),
        Permission.update(Role.team(ADMIN_TEAM_ID)),
        Permission.delete(Role.team(ADMIN_TEAM_ID)),
        Permission.read(Role.user(user.$id))
      ]
    });
  }catch (err) {
    console.error(
      "Profile creation failed:",
      err
    );
  }
}