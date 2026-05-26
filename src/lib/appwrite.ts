import { Client, Account, Databases, TablesDB} from "appwrite";

export const client = new Client()
  .setEndpoint(import.meta.env.PUBLIC_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const tables = new TablesDB(client);

export const DATABASE_ID = import.meta.env.PUBLIC_APPWRITE_DATABASE_ID;

export const COLLECTIONS = {
  QUIZ_ATTEMPTS: "quiz_attempts",
  USER_PROFILES: "user_profiles"
};