import { tables, DATABASE_ID, COLLECTIONS } from "./appwrite";

export type LevelField =
  | "electricalLevel"
  | "assemblyLevel"
  | "designLevel"
  | "machiningLevel"
  | "programmingLevel"
  | "awardsLevel"
  | "mediaLevel"
  | "outreachLevel"
  | "scoutingLevel"
  | "safetyLevel";

export async function updateLevel(
  rowId: string,
  field: LevelField,
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