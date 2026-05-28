import { ID, Query } from "appwrite";
import {
  account,
  tables,
  DATABASE_ID,
  COLLECTIONS
} from "./appwrite";
import { isMember } from "./isMember";
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
      }
  });

  } catch (err) {
    console.error(
      "Profile creation failed:",
      err
    );
  }
}