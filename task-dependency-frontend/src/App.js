import { useState } from "react";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Design UI",
      description: "Create clean UI",
      status: "completed",
      deps: [],
    },
    {
      id: 2,
      title: "Build Frontend",
      description: "React components",
      status: "in_progress",
      deps: [1],
    },
    {
      id: 3,
      title: "Connect Backend",
      description: "API integration",
      status: "pending",
      deps: [],
    },
  ]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");

  const [taskId, setTaskId] = useState("");
  const [depId, setDepId] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  /* ---------- HELPERS ---------- */

  const getTask = (id) => tasks.find((t) => t.id === id);

  const createsCycle = (start, current) => {
    if (start === current) return true;
    const t = getTask(current);
    if (!t) return false;
    return t.deps.some((d) => createsCycle(start, d));
  };

  const dependentTasks = (id) =>
    tasks.filter((t) => t.deps.includes(id));

  /* ---------- ACTIONS ---------- */

  const addTask = () => {
    if (!title.trim()) {
      setMessage("❌ Task title required");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          title,
          description,
          status,
          deps: [],
        },
      ]);
      setTitle("");
      setDescription("");
      setStatus("pending");
      setMessage("✅ Task added");
      setLoading(false);
    }, 500);
  };

  const updateStatus = (id, newStatus) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, status: newStatus } : t
      )
    );
    setMessage("✅ Status updated");
  };

  const addDependency = () => {
    if (!taskId || !depId) {
      setMessage("❌ Select both tasks");
      return;
    }
    if (taskId === depId) {
      setMessage("❌ Task cannot depend on itself");
      return;
    }

    setLoading(true);
    setMessage("⏳ Checking dependency...");

    setTimeout(() => {
      if (createsCycle(taskId, depId)) {
        setMessage("❌ Circular dependency detected");
      } else {
        setTasks(
          tasks.map((t) =>
            t.id === taskId
              ? { ...t, deps: [...t.deps, depId] }
              : t
          )
        );
        setMessage("✅ Dependency added");
      }
      setTaskId("");
      setDepId("");
      setLoading(false);
    }, 700);
  };

  const deleteTask = () => {
    setTasks(tasks.filter((t) => t.id !== deleteId));
    setDeleteId(null);
    setMessage("🗑 Task deleted");
  };

  /* ---------- GRAPH ---------- */

  const spacing = 170;
  const radius = 56;

  return (
    <div className="app">
      <h1>Task Dependency Tracker</h1>
      <p className="subtitle">Manage tasks intelligently</p>

      {message && <div className="message">{message}</div>}

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

        <button disabled={loading} onClick={addTask}>
          {loading ? "Adding..." : "Add Task"}
        </button>
      </section>

      {/* TASK LIST */}
      <section className="card">
        <h2>Tasks</h2>

        {tasks.length === 0 && (
          <div className="empty">No tasks yet</div>
        )}

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
                onChange={(e) =>
                  updateStatus(t.id, e.target.value)
                }
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>

              <button
                className="delete"
                onClick={() => setDeleteId(t.id)}
              >
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

        <button disabled={loading} onClick={addDependency}>
          {loading ? "Checking..." : "Add Dependency"}
        </button>
      </section>

      {/* GRAPH */}
      <section className="card">
        <h2>Dependency Graph</h2>

        <svg width="100%" height="260">
          {tasks.map((t, i) =>
            t.deps.map((d) => {
              const from = tasks.findIndex((x) => x.id === d);
              return (
                <line
                  key={`${t.id}-${d}`}
                  x1={from * spacing + 90}
                  y1={130}
                  x2={i * spacing + 90}
                  y2={130}
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
              );
            })
          )}

          {tasks.map((t, i) => (
            <g key={t.id}>
              <circle
                cx={i * spacing + 90}
                cy={130}
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
                x={i * spacing + 90}
                y={122}
                textAnchor="middle"
                fill="#020617"
                fontSize="11"
                fontWeight="700"
              >
                {t.title
                  .split(" ")
                  .slice(0, 2)
                  .map((word, idx) => (
                    <tspan
                      key={idx}
                      x={i * spacing + 90}
                      dy={idx === 0 ? 0 : 14}
                    >
                      {word}
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
            <div className="modal-header">
              ⚠️ <h3>Delete task?</h3>
            </div>

            {dependentTasks(deleteId).length > 0 && (
              <div className="dependency-warning">
                <p>This task is used by:</p>
                <ul>
                  {dependentTasks(deleteId).map((t) => (
                    <li key={t.id}>{t.title}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="modal-subtext">
              This action cannot be undone.
            </p>

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
