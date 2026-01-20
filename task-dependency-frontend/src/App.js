import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/tasks/";

export default function App() {
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");

  const [taskId, setTaskId] = useState("");
  const [depId, setDepId] = useState("");

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  /* ---------- TOAST ---------- */
  const showToast = useCallback((type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ---------- LOAD TASKS ---------- */
  const loadTasks = useCallback(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setTasks)
      .catch(() => showToast("error", "Failed to load tasks"));
  }, [showToast]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /* ---------- HELPERS ---------- */
  const dependentTasks = (id) =>
    tasks.filter((t) => (t.dependencies || []).includes(id));

  /* ---------- AUTO UPDATE DEPENDENTS ---------- */
  const autoUpdateDependents = async (completedTaskId) => {
    const dependents = tasks.filter((t) =>
      (t.dependencies || []).includes(completedTaskId)
    );

    for (const task of dependents) {
      await fetch(`${API_URL}${task.id}/auto-update/`, {
        method: "POST",
      });
    }
  };

  /* ---------- ACTIONS ---------- */
  const addTask = async () => {
    if (!title.trim()) {
      showToast("error", "Task title is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status }),
      });
      const data = await res.json();
      setTasks((prev) => [...prev, data]);
      setTitle("");
      setDescription("");
      setStatus("pending");
      showToast("success", "Task added");
    } catch {
      showToast("error", "Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error();

      // 🔥 AUTO STATUS UPDATE WHEN DEPENDENCY COMPLETES
      if (newStatus === "completed") {
        await autoUpdateDependents(id);
      }

      await loadTasks();
      showToast("success", "Status updated");
    } catch {
      showToast("error", "Status update failed");
    }
  };

  /* ---------- ADD DEPENDENCY ---------- */
  const addDependency = async () => {
    if (!taskId || !depId) {
      showToast("error", "Select both tasks");
      return;
    }

    if (taskId === depId) {
      showToast("error", "Task cannot depend on itself");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${taskId}/dependencies/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depends_on_id: depId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await loadTasks();
      setTaskId("");
      setDepId("");
      showToast("success", "Dependency added");
    } catch (err) {
      showToast("error", err.message || "Dependency not allowed");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    try {
      await fetch(`${API_URL}${deleteId}/`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== deleteId));
      showToast("success", "Task deleted");
    } catch {
      showToast("error", "Delete failed");
    } finally {
      setDeleteId(null);
    }
  };

  /* ---------- GRAPH ---------- */
  const spacing = 180;
  const radius = 50;
  const centerY = 120;

  const splitText = (text, maxChars = 10) => {
    const words = text.split(" ");
    const lines = [];
    let current = "";

    words.forEach((word) => {
      if ((current + " " + word).trim().length <= maxChars) {
        current = (current + " " + word).trim();
      } else {
        lines.push(current);
        current = word;
      }
    });

    if (current) lines.push(current);
    return lines.slice(0, 3);
  };

  return (
    <div className="app">
      <h1>Task Dependency Tracker</h1>
      <p className="subtitle">Manage tasks intelligently</p>

      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}

      {/* CREATE TASK */}
      <section className="card">
        <h2>Create Task</h2>

        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
        </select>

        <button onClick={addTask} disabled={loading}>
          {loading ? "Adding..." : "Add Task"}
        </button>
      </section>

      {/* TASK LIST */}
      <section className="card">
        <h2>Tasks</h2>

        {tasks.map((t) => (
          <div className="task-row" key={t.id}>
            <div>
              <strong>{t.title}</strong>
              <p className="desc">{t.description}</p>
            </div>

            <div className="actions">
              <select
                className={`status ${t.status}`}
                value={t.status}
                onChange={(e) => updateStatus(t.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>

              <button className="delete" onClick={() => setDeleteId(t.id)}>
                🗑
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* ADD DEPENDENCY */}
      <section className="card">
        <h2>Add Dependency</h2>

        <select value={taskId} onChange={(e) => setTaskId(+e.target.value)}>
          <option value="">Select Task</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        <select value={depId} onChange={(e) => setDepId(+e.target.value)}>
          <option value="">Depends On</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        <button onClick={addDependency} disabled={loading}>
          {loading ? "Checking..." : "Add Dependency"}
        </button>
      </section>

      {/* DEPENDENCY GRAPH */}
      <section className="card">
        <h2>Dependency Graph</h2>

        <svg width="100%" height="240">
          {tasks.map((t, i) =>
            (t.dependencies || []).map((d) => {
              const from = tasks.findIndex((x) => x.id === d);
              if (from === -1) return null;

              return (
                <line
                  key={`${t.id}-${d}`}
                  x1={from * spacing + 80}
                  y1={centerY}
                  x2={i * spacing + 80}
                  y2={centerY}
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
              );
            })
          )}

          {tasks.map((t, i) => (
            <g key={t.id}>
              <circle
                cx={i * spacing + 80}
                cy={centerY}
                r={radius}
                fill={
                  t.status === "completed"
                    ? "#22c55e"
                    : t.status === "in_progress"
                    ? "#38bdf8"
                    : t.status === "blocked"
                    ? "#ef4444"
                    : "#64748b"
                }
              />

              <text
                x={i * spacing + 80}
                y={centerY}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
              >
                {splitText(t.title).map((line, idx) => (
                  <tspan
                    key={idx}
                    x={i * spacing + 80}
                    dy={idx === 0 ? "-6" : "14"}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          ))}
        </svg>
      </section>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="modal-bg">
          <div className="modal">
            <h3>Delete task?</h3>

            {dependentTasks(deleteId).length > 0 && (
              <div className="dependency-warning">
                Used by:
                <ul>
                  {dependentTasks(deleteId).map((t) => (
                    <li key={t.id}>{t.title}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-danger" onClick={deleteTask}>
                Delete
              </button>
              <button
                className="btn-secondary"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
