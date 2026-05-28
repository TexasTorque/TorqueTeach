import { useEffect, useState } from "react";
import { tables, DATABASE_ID, COLLECTIONS } from "../lib/appwrite";
import { Query } from "appwrite";
import { isAdmin } from "../lib/isAdmin";

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("userName");
  const [descending, setDescending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const admin = await isAdmin();

        if (!alive) return;

        if (!admin) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        setAuthorized(true);

        // only runs if admin
        await loadUsers();

      } catch (err) {
        console.error(err);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let result = [...users];

    // search
    if (search.trim()) {
      result = result.filter((u) =>
        (u.userName ?? "").toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // sort
    result.sort((a, b) => {
      const rawAv = a[sortField];
      const rawBv = b[sortField];
      const isTextSort = typeof rawAv === "string" || typeof rawBv === "string";
      const av = isTextSort ? (rawAv ?? "") : (rawAv ?? 0);
      const bv = isTextSort ? (rawBv ?? "") : (rawBv ?? 0);

      // text sort
      if (isTextSort) {
        return descending
          ? bv.localeCompare(av)
          : av.localeCompare(bv);
      }

      // number sort
      return descending
        ? bv - av
        : av - bv;
    });

    setFilteredUsers(result);

  }, [users, search, sortField, descending]);

  async function loadUsers() {

    try {
      const result = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: COLLECTIONS.USER_PROFILES,
        queries: [
          Query.limit(100)
        ]
      });

      setUsers(result.rows ?? []);

    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
      return <p>Loading...</p>;
    }

  if (!authorized) {
    return (
      <p style={{ color: "red" }}>
        Access denied
      </p>
    );
  }
  return (
    <div>

      <div
        style={{
          display:"flex",
          gap:"1rem",
          marginBottom:"1rem"
        }}
      >

        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search user..."
          style={{
            backgroundColor: "var(--sl-color-bg)",
            border: "1px solid var(--sl-color-gray-5)",
            padding: "0.5rem",
            borderRadius: "6px",
            fontSize: "16px"
          }}
        />

        <select
          value={sortField}
          onChange={(e)=>setSortField(e.target.value)}
          style={{
            backgroundColor: "var(--sl-color-bg)",
            border: "1px solid var(--sl-color-gray-5)",
            padding: "0.5rem",
            borderRadius: "6px",
            fontSize: "16px"
          }}
        >
          <option value="userName">
            Name
          </option>

          <option value="electricalLevel">
            Electrical
          </option>

          <option value="assemblyLevel">
            Assembly
          </option>

          <option value="designLevel">
            Design
          </option>

          <option value="programmingLevel">
            Programming
          </option>
          <option value="machiningLevel">
            Machining
          </option>
          <option value="awardsLevel">
            Awards
          </option>
          <option value="mediaLevel">
            Media
          </option>
          <option value="outreachLevel">
            Outreach
          </option>
          <option value="scoutingLevel">
            Scouting
          </option>
          <option value="safetyLevel">
            Safety
          </option>

        </select>

        <button
          onClick={() =>
            setDescending(!descending)
          }
          style={{
            backgroundColor: "var(--sl-color-accent)",
            fontWeight: "bold",
            color: "var(--sl-color-bg)",
            border: "none",
            padding: "0",
            borderRadius: "6px",
            cursor: "pointer",
            width: "75px",
            height: "75px",
            lineHeight: "75px",
            textAlign: "center",
            justifyContent: "center",
            fontSize: "30px"
          }}

        >
          {descending ? "↓" : "↑"}
        </button>

      </div>

      <table style={{width:"100%"}}>
        <tbody>

        {filteredUsers.map((u)=>(

          <tr key={u.$id}>

            <td>
              <a href={`/profiles?userId=${u.userID}`}>
                {u.userName}
              </a>
            </td>

            <td>
              Electrical: {u.electricalLevel ?? 0}
            </td>

            <td>
              Programming: {u.programmingLevel ?? 0}
            </td>
            <td>
              Assembly: {u.assemblyLevel ?? 0}
            </td>

            <td>
              Design: {u.designLevel ?? 0}
            </td>
            <td>
              Machining: {u.machiningLevel ?? 0}
            </td>
            <td>
              Awards: {u.awardsLevel ?? 0}
            </td>
            <td>
              Media: {u.mediaLevel ?? 0}
            </td>
            <td>
              Outreach: {u.outreachLevel ?? 0}
            </td>
            <td>
              Scouting: {u.scoutingLevel ?? 0}
            </td>
            <td>
              Safety: {u.safetyLevel ?? 0}
            </td>

          </tr>

        ))}

        </tbody>
      </table>

    </div>
  );
}