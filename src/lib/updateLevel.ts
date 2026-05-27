import { tables, DATABASE_ID, COLLECTIONS } from "./appwrite";

export async function updateLevel(
  rowId: string,
  field: string,
  value: number
) {
  return await tables.updateRow({
    databaseId: DATABASE_ID,
    tableId: COLLECTIONS.USER_PROFILES,
    rowId,
    data: {
      [field]: value
    }
  });
}