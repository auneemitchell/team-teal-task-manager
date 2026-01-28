import { useEffect, useState } from "react";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json().catch(() => null);
      if (Array.isArray(data)) setTasks(data);
      else setTasks([]);
    } catch (err) {
      console.error("Fetch error", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1>Tasks</h1>
      {loading ? (
        <div>Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div>No tasks available.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingBottom: 6 }}>ID</th>
              <th style={{ textAlign: "left", paddingBottom: 6 }}>Title</th>
              <th style={{ textAlign: "left", paddingBottom: 6 }}>Start</th>
              <th style={{ textAlign: "left", paddingBottom: 6 }}>End</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td style={{ padding: "6px 8px" }}>{t.id}</td>
                <td style={{ padding: "6px 8px" }}>{t.title || t.description || "-"}</td>
                <td style={{ padding: "6px 8px" }}>{t.start_date || "-"}</td>
                <td style={{ padding: "6px 8px" }}>{t.end_date || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
